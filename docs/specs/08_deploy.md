# Spec 08 — Deploy a producción

Estado: listo para ejecutar
Destino: backend y Postgres en Render + Neon, frontend en Vercel
Dominios: `mitzuri.com` para el sitio, `api.mitzuri.com` para el API

Esta spec tiene dos partes. **La parte A la ejecuta Claude Code**, son cambios
de código. **La parte B la ejecutas tú**, son paneles web que ningún agente
puede tocar.

---

# Parte A — Cambios de código

## A1. El Dockerfile arranca el servidor de desarrollo

`backend/Dockerfile` termina en:

```dockerfile
CMD ["npm", "run", "dev"]
```

Eso levanta **nodemon**, que vigila archivos y reinicia el proceso. En
producción es un desperdicio de memoria y un riesgo: cualquier escritura en
disco reinicia el servidor.

Cambiar a:

```dockerfile
CMD ["npm", "start"]
```

Y como en producción no hacen falta las dependencias de desarrollo, usar
`npm ci --omit=dev` en vez de `npm install`.

## A2. Las migraciones tienen que correr antes de arrancar

En producción nadie va a ejecutar `npm run db:migrate` a mano en cada despliegue.

En `backend/package.json`:

```json
"start": "node scripts/migrate.js && node src/server.js"
```

El runner registra cada migración con checksum y salta las ya aplicadas, así que
correrlo en cada arranque es inofensivo.

## A3. El backend imprime su configuración de base de datos en los logs

Al final de `backend/src/shared/db/index.js` hay un `console.log` que vuelca
`DB_HOST` y si existe `DATABASE_URL` cada vez que arranca el proceso. Servía para
depurar en local; en los logs de producción es ruido e información de más.

Bórralo, o enciérralo en `if (!isProduction)`, que ya está exportado desde
`shared/utils/env.js`.

## A4. Si la base falla al arrancar, el proceso muere sin explicar nada

`server.js` llama a `testDBConnection()`, que relanza el error. Como
`startServer()` no lo captura, sale como promesa rechazada sin manejar y el
mensaje se pierde entre el volcado de pila.

En Render eso se traduce en un servicio que no levanta y unos logs ilegibles —
justo cuando más falta hace entender qué pasó.

```js
const startServer = async () => {
  try {
    await testDBConnection();
  } catch {
    console.error("No se pudo conectar a la base de datos. Revisa DATABASE_URL.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
```

## A5. CORS acepta un solo origen

Hoy es `origin: process.env.FRONTEND_URL`. En producción vas a tener al menos
`https://mitzuri.com` y las URLs de vista previa que genera Vercel en cada
despliegue.

Que `FRONTEND_URL` admita una lista separada por comas:

```js
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
```

Y pásala tal cual a `cors({ origin: allowedOrigins, credentials: true })`.

## A6. Un endpoint de salud que compruebe la base

Hoy `GET /` responde `"API Running"` aunque la base esté caída. Al desplegar,
eso es exactamente lo que necesitas distinguir.

```
GET /health  →  200 { "status": "ok", "database": "ok" }
             →  503 { "status": "error", "database": "error" }
```

Hace un `SELECT 1`. Va **antes** del middleware de auth y sin token.

## A7. Vercel necesita saber que esto es una aplicación de una sola página

Sin esto, entrar directo a `mitzuri.com/proyectos/musmania` devuelve 404. Navegar
desde el feed funciona; **compartir el enlace no** — que es justo lo que Samira
va a hacer con sus clientes.

Crear `frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## A8. Documentar la variable nueva

En `.env.example`, dejar constancia de que `FRONTEND_URL` admite varios orígenes
separados por comas.

---

# Parte B — Lo que haces tú

Sigue este orden. Cada paso depende del anterior.

## B1. Base de datos en Neon

1. Crea una cuenta y un proyecto en Neon, región la más cercana a México
2. Copia la cadena de conexión **con pooler** — la que dice `-pooler` en el
   host. Esa es la que aguanta muchas conexiones cortas
3. Guárdala; es tu `DATABASE_URL` de producción

## B2. Migrar y sembrar, desde tu máquina

Neon está vacío. Lo llenas desde tu computadora, una sola vez.

Crea `.env.production` **temporal** en la raíz, sin commitearlo:

```
DATABASE_URL=<la cadena con pooler de Neon>
DB_SSL=true
ADMIN_EMAIL=<el correo de Samira>
ADMIN_PASSWORD=<una contraseña larga y aleatoria>
ADMIN_FULL_NAME=Samira Mitzuri
```

Y córrelo apuntando ahí:

```bash
node --env-file=.env.production backend/scripts/migrate.js
node --env-file=.env.production backend/scripts/seed-dev.js
```

Verifica en el panel de Neon que existan las tablas y un usuario. **Borra
`.env.production` cuando termines.**

## B3. Backend en Render

Servicio web nuevo, conectado a tu repo de GitHub.

- Directorio raíz: `backend`
- Entorno: Docker
- Ruta de comprobación de salud: `/health`

Variables de entorno:

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | la cadena con pooler de Neon |
| `JWT_SECRET` | **genera uno nuevo, largo y aleatorio** |
| `PREVIEW_TOKEN_SECRET` | otro distinto |
| `CLOUDFLARE_ACCOUNT_ID` | el tuyo |
| `CLOUDFLARE_ACCESS_KEY_ID` | el tuyo |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | el tuyo |
| `R2_BUCKET` | `mitzuri` |
| `R2_PUBLIC_BASE_URL` | `https://cdn.mitzuri.com` |
| `FRONTEND_URL` | provisional: la URL que te dé Vercel |

**Nunca reutilices el `JWT_SECRET` de tu `.env` local.** Ese archivo estuvo en
tu disco durante meses y el repositorio es público: si alguna vez se filtrara,
cualquiera podría firmar sesiones válidas de administradora.

Cuando levante, abre `https://<lo-que-te-dio-render>/health`. Tiene que
responder `ok` en los dos campos. Si dice `error` en `database`, el problema es
la cadena de conexión, no el código.

## B4. Frontend en Vercel

- Directorio raíz: `frontend`
- Variable de entorno: `VITE_API_BASE_URL` con la URL del backend

**Esa variable se lee al construir, no al ejecutar.** Si la cambias, hay que
volver a desplegar; no basta con recargar la página.

## B5. Dominios

- `mitzuri.com` → Vercel
- `api.mitzuri.com` → Render

Los dos por Cloudflare, donde ya administras `cdn.mitzuri.com`.

## B6. Cerrar el círculo

Con los dominios funcionando, vuelve a Render y ajusta:

```
FRONTEND_URL=https://mitzuri.com,https://www.mitzuri.com
```

Y en Vercel:

```
VITE_API_BASE_URL=https://api.mitzuri.com
```

Vuelve a desplegar el frontend para que tome el valor nuevo.

---

## Criterios de aceptación

Parte A, verificable por Claude Code:

- [ ] El `Dockerfile` ejecuta `npm start`, no `npm run dev`
- [ ] `npm start` corre migraciones y después levanta el servidor
- [ ] Los logs de arranque ya no imprimen la configuración de base de datos
- [ ] Con una `DATABASE_URL` inválida, el proceso muere con un mensaje claro
- [ ] `GET /health` responde `200` con la base viva
- [ ] `FRONTEND_URL` con dos orígenes separados por coma permite a los dos
- [ ] Existe `frontend/vercel.json` con la reescritura
- [ ] Lint de backend y frontend, y build de frontend, limpios

Parte B, verificable por ti, en producción:

- [ ] `https://api.mitzuri.com/health` responde `ok` en los dos campos
- [ ] `https://mitzuri.com` carga el feed
- [ ] **Abrir `https://mitzuri.com/proyectos/<slug>` directo en el navegador
      funciona**, no da 404 — este es el que más se rompe
- [ ] Puedes iniciar sesión en `/admin` con las credenciales de producción
- [ ] Subir una imagen funciona y se ve servida desde `cdn.mitzuri.com`
- [ ] Un proyecto `unlisted` responde por su URL y no sale en el feed
- [ ] No hay errores de CORS en la consola del navegador

---

## Lo que hay que saber, no arreglar

El plan gratuito de Render **duerme el servicio a los 15 minutos** sin uso. La
primera visita después de un rato tarda entre 30 y 60 segundos.

Para que Samira cargue su portafolio es irrelevante. Para compartir el sitio con
alguien a quien quieras impresionar, no lo es. Cuando llegue ese momento hay dos
salidas: mover las subidas a URLs firmadas y pasar el backend a Vercel, o pagar
un plan que no duerma.

No lo resuelvas ahora. Solo no se te olvide antes de mandar el enlace.
