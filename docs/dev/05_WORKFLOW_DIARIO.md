# Workflow diario

Cómo se levanta el proyecto y qué se verifica antes de dar algo por terminado.
El método de trabajo con specs y auditorías está en
[08_COMO_TRABAJAMOS.md](08_COMO_TRABAJAMOS.md).

## Levantar el entorno local

```bash
docker compose up -d          # PostgreSQL 18
npm run db:migrate            # aplica lo pendiente
npm run db:seed               # crea o actualiza la admin local
npm run dev                   # backend y frontend en paralelo
```

Backend en `http://localhost:3000`, frontend en `http://localhost:5173`.

La primera vez que Postgres arranca con un volumen nuevo, tarda unos segundos en
inicializar y **rechaza conexiones mientras tanto**. Si `db:migrate` responde
`ECONNREFUSED` justo después de levantar el contenedor, espera a ver
`database system is ready to accept connections` en `docker compose logs db`.

## Verificaciones antes de cerrar un cambio

```bash
npm run lint --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
```

Lint del paquete que tocaste, y build del frontend si tocaste frontend.

Y una comprobación que ninguna herramienta hace por ti:

```bash
grep -rE "stone-|slate-|gray-|zinc-" frontend/src
```

Tiene que salir vacío. Los colores literales de Tailwind están prohibidos: solo
tokens del `@theme`.

## Orden dentro de una tarea

1. Una sola tarea activa. No abrir módulos en paralelo
2. Si toca el schema, la migración va primero y como archivo nuevo
3. Backend antes que frontend: el contrato de API se cierra primero
4. Lint, y build si aplica
5. Probar en el navegador lo que solo se puede probar ahí
6. Commit, con la spec ya commiteada aparte y antes

## Qué solo puedes verificar tú

Un asistente puede leer el repositorio, correr lint y `tsc`, y auditar un diff.
No puede correr migraciones contra una base, abrir un navegador, ni entrar a
Render, Vercel, Neon o Cloudflare.

Así que después de cada cambio con superficie visible, la parte que importa es
tuya: abrir la pantalla, hacer el flujo completo, y mirar si algo se ve mal.

## Diagnosticar producción

La primera parada siempre es la misma:

```
https://api.mitzuri.com/health
```

- `{"status":"ok","database":"ok"}` → el backend y la base están bien, el
  problema está más arriba
- `database: "error"` → la conexión a Neon
- no responde → el servicio no levantó, o el dominio no resuelve. Probar con la
  URL directa de Render descarta el DNS

Si el sitio carga pero no trae datos, abre la consola del navegador:

- **errores de CORS** → el origen exacto que aparece en el mensaje no está en
  `FRONTEND_URL` del backend
- **peticiones a `undefined/...`** → `VITE_API_BASE_URL` no llegó a la
  compilación. Redesplegar en Vercel **sin caché**
- **primera carga de 40 segundos** → el backend despertando. No es un fallo

## Comandos de referencia

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | backend y frontend en paralelo |
| `npm run db:migrate` | aplica migraciones pendientes |
| `npm run db:seed` | crea o actualiza la admin |
| `npm run lint --prefix <paquete>` | lint |
| `npm run build --prefix frontend` | `tsc -b` más build de Vite |

Para correr un script contra otra base, sin tocar tu `.env`:

```bash
node --env-file=.env.production backend/scripts/migrate.js
```

Borra ese archivo al terminar. Está cubierto por el `.gitignore`, pero no tiene
por qué quedarse en disco.
