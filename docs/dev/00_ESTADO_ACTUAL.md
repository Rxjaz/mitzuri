# Estado actual del repo

Snapshot revisado el `2026-08-23`, contra el codigo y las once migraciones.

## Resumen ejecutivo

**La v1 esta completa y en produccion.** La disenadora puede crear un proyecto,
subirle portada y galeria, ordenarlo, publicarlo o compartirlo en privado por
URL, y verlo en el sitio publico. Todo desde el panel, sin tocar la base ni
depender de nadie.

Las ocho fases de [04_FASES.md](04_FASES.md) estan cerradas, con una cancelada a
proposito: la preview por token, cuyo caso de uso real lo resolvio el estado
`unlisted`.

El riesgo ya no es que falten features: es que **nadie ha usado el producto**.
La disenadora no lo ha tocado y sus doce proyectos siguen en un PDF. La v2 se
planea con esa experiencia en la mano, no antes.

## Cambios de este snapshot (`2026-08-11` a `2026-08-23`)

- se normalizaron los finales de linea con `.gitattributes`; antes cada archivo tocado en Windows aparecia como reescrito entero y ensuciaba todos los diffs
- se agrego `CLAUDE.md` en la raiz con las convenciones del repo
- `docs/` dejo de estar en `.gitignore` y ahora se versiona
- se creo `docs/specs/`, donde vive una spec ejecutable por tarea
- tercer estado de proyecto: `draft`, `unlisted`, `published` (migracion `007`)
- nueva columna `projects.slug_locked`
- nuevo endpoint `POST /admin/projects/:id/unlist`
- **fix**: el slug se congelaba solo mientras el proyecto estuviera publicado, asi que despublicar lo volvia a liberar y cambiar el titulo rompia una URL ya compartida. Ahora el bloqueo es permanente desde la primera vez que el proyecto deja de ser borrador
- `ProjectsPage` muestra solo las transiciones validas segun el estado actual
- sistema visual real: tokens de color y tipografia en el `@theme` de `index.css`, con la identidad de la disenadora (Yeseva One, Be Vietnam Pro, `#070707`, `#FFFFFF`, `#0D30F2`)
- fuentes self-hosted con `@fontsource`; la display solo se importa en `PublicLayout`, el admin va todo en Be Vietnam Pro
- se eliminaron los colores literales de Tailwind del codigo, salvo en `FeedLabPage`, que es maqueta desechable
- el boton primario pasa de negro a azul de marca
- modulo `media` en backend: `POST /admin/media` recibe el archivo, lo sube a R2 y registra el asset
- `apiClient` ya sabe mandar `FormData`: cuando el cuerpo es multipart no fija el `Content-Type`, para que el navegador escriba el `boundary`
- `errorMiddleware` traduce los errores de multer a `ValidationError`, asi que un archivo demasiado grande responde `400` y no `500`
- componente `ImageUpload`: la portada se sube desde el formulario, ya no se pega una URL a mano
- sitio publico: `GET /projects` y `GET /projects/:slug`, feed y pagina por slug
- un proyecto `unlisted` responde por su URL pero no aparece en el feed, y lleva `noindex`
- columna `sort_order`: el orden del portafolio es editorial, no cronologico
- modulo `sections` con el tipo `image`: galeria por proyecto, con CRUD y reordenamiento
- migracion `009`: el indice unico de `(project_id, position)` paso a restriccion diferible, para poder reordenar en una sola transaccion
- migracion `010`: la portada dejo de ser una URL suelta y ahora es `cover_media_id`, con llave foranea a `media_assets`
- con eso el proyecto conoce ancho, alto y texto alternativo de su portada: el feed se adapta a la forma de cada imagen y ya no recorta
- feed en mosaico de dos columnas, repartidas alternando para que el orden curado se lea de izquierda a derecha; en movil colapsa a una columna con el orden exacto
- `PUT /admin/media/:id` para corregir el texto alternativo de un asset ya subido
- migracion `011`: metadatos del portafolio — `category`, `tools`, `accent_color` y `credits`
- las tres categorias son las de la disenadora: `editorial`, `marca`, `ilustracion`. Se guardan sin acentos y la etiqueta legible la arma el frontend
- `accent_color` se aplica redefiniendo `--color-brand` en la pagina del proyecto, asi que todo lo que use `brand` ahi dentro cambia solo
- el hex se valida en Zod y ademas con un `CHECK` en la base: entra como variable CSS, y cualquier otro formato seria inyeccion en el atributo `style`
- `lib/contrast.ts` calcula la relacion de contraste WCAG; el formulario avisa si el acento baja de 4.5:1 sobre blanco, pero no bloquea

## Cambios del snapshot `2026-08-09`

- `services/projects.service.ts` cubre las siete operaciones del CRUD
- `types/project.ts` tipa `Project` y `ProjectInput`
- `ProjectsPage` lista proyectos con estados de carga, error y vacio, mas acciones por fila
- `ProjectFormPage` sirve alta y edicion en la misma pantalla, segun exista `:id`
- rutas `/admin/projects/new` y `/admin/projects/:id/edit` bajo `ProtectedRoute`
- `Button` acepta `variant` (`primary`, `secondary`, `danger`) y se agrego `Textarea`
- fix backend: `createProject` no persistia `cover_image_url` en el `INSERT`
- fix backend: `errorMiddleware` necesita los 4 parametros para que Express lo tome como manejador de error
- fix backend: en Zod 4 los problemas estan en `error.issues`, no en `error.errors`

## Cambios del snapshot `2026-07-27`

- se implemento la sesion persistente del admin: `AuthProvider`, `useAuth`, `ProtectedRoute`, `GuestRoute`
- `apiClient` ahora lanza `ApiError` con `status` y emite `auth:unauthorized` en `401`
- el acceso a `localStorage` quedo aislado en `services/token.storage.ts` con la clave `mitzuri.token`
- los tipos `User` y `LoginResponse` se movieron a `src/types/auth.ts`
- `AdminLayout` muestra el usuario de sesion y tiene boton de salir
- se agrego Tailwind 4 y `src/styles/components.css`
- se agregaron `.env.example` en la raiz y en `frontend/`
- se creo `README.md` publico en la raiz
- `docs/` dejo de estar versionado en git (sigue en disco, ahora en `.gitignore`)

## Lo que existe de verdad

### Backend

- [x] Express 5 con la cadena `routes → controller → service → repository`
- [x] Middleware de errores, de validacion con Zod, de auth con JWT y de subida
- [x] Modulo `auth`: `login`, `logout`, `me`
- [x] Modulo `projects`: CRUD, tres estados y dos endpoints publicos
- [x] Modulo `media`: subida real a R2 y edicion del texto alternativo
- [x] Modulo `sections`: CRUD, reordenamiento y schema por tipo
- [x] `GET /health` que comprueba la conexion a la base
- [x] CORS con lista de origenes separados por comas

### Base de datos

- [x] Runner propio de migraciones con checksum, y tabla `schema_migrations`
- [x] Once migraciones aplicadas, de `001` a `011`
- [x] Seed de la administradora con `upsert` por email
- [x] Migraciones corriendo solas al arrancar en produccion

### Frontend

- [x] React 19 + TypeScript + Vite, con Tailwind 4 y tokens propios
- [x] `apiClient` compartido, con `ApiError` y soporte de `FormData`
- [x] Sesion persistente con `AuthProvider`, guards y token aislado
- [x] Admin: login, dashboard, listado, formulario y galeria
- [x] Publico: feed en mosaico y pagina por slug
- [x] Tipografias self-hosted; la display solo se carga en el sitio publico

## Lo que falta

- [ ] **Tests.** No hay ninguno
- [ ] CI
- [ ] Open Graph por proyecto
- [ ] Derivados optimizados de imagen
- [ ] Limpieza de archivos huerfanos en R2
- [ ] Corregir el typo `"Inavlid token"` en `auth.middleware.js`
- [ ] `last_login_at` existe en la tabla y nunca se escribe
- [ ] Aviso de exito al guardar en el formulario de proyecto

## Hallazgos del codigo actual

- `POST /auth/logout` exige token pero no invalida el JWT. El frontend lo llama
  best-effort y limpia igual el token local
- No hay refresh token: el JWT dura `1d` y al vencer el siguiente `401` cierra la
  sesion. Aceptable para una sola administradora
- El token vive en `localStorage`, asi que un XSS podria leerlo. La alternativa
  segura seria cookie `httpOnly`, con refactor de backend y CORS con
  credenciales. Decision consciente, no descuido
- `is_active` si se respeta en `login` y en `getMe`: desactivar una cuenta
  invalida sus tokens en la siguiente peticion
- Quedaron carpetas vacias de decisiones revertidas:
  `backend/src/shared/validators/` —la validacion vive en los schemas de cada
  modulo— y `frontend/src/components/{admin,blocks,shared}` —todo lo compartido
  acabo en `ui/`—. Git no las rastrea, pero conviene borrarlas del disco
- Sobran dos `.gitkeep` cuyas carpetas ya tienen contenido:
  `frontend/src/app/admin/layout/` y `frontend/src/components/ui/`
- `frontend/src/App.css` esta vacio y no se importa desde ningun lado. Es un
  resto del starter de Vite

## Verificacion tecnica realizada

Comprobado el `2026-08-23`:

- [x] `npm run lint --prefix backend`
- [x] `npm run lint --prefix frontend`
- [x] `npx tsc -b` en frontend
- [x] `grep -rE "stone-|slate-|gray-|zinc-" frontend/src` sin resultados
- [x] Once migraciones contrastadas una por una contra lo que dicen los
      documentos
- [x] Flujo completo probado en produccion: login, alta, subida de portada,
      galeria, reordenamiento, publicar, compartir en privado y abrir la URL de
      un proyecto directo en el navegador


## Lectura rapida del momento del proyecto

1. ~~login~~ hecho
2. ~~sesion valida~~ hecho
3. ~~listado de proyectos~~ hecho
4. ~~creacion y edicion base~~ hecho
5. ~~estados de publicacion~~ hecho
6. ~~sistema visual: tokens de color y tipografia~~ hecho
7. ~~subida de portada~~ hecho
8. ~~sitio publico minimo: feed y pagina de proyecto~~ hecho
9. ~~galeria de imagenes por proyecto~~ hecho
10. ~~portada con proporcion real y feed adaptable~~ hecho
11. ~~metadatos del portafolio: categorias, herramientas, acento, creditos~~ hecho
12. ~~deploy~~ hecho
13. contenido real cargado por la disenadora

## En produccion

Desplegado y funcionando desde el `2026-08-23`:

| Pieza | Donde vive |
| --- | --- |
| Sitio publico y admin | Vercel, plan Hobby, en `mitzuri.com` y `www.mitzuri.com` |
| API | Render, plan gratuito, en `api.mitzuri.com` |
| Base de datos | Neon, plan gratuito, Postgres 18, region Ohio |
| Imagenes | Cloudflare R2, servidas por `cdn.mitzuri.com` |

Render y Neon estan en la misma region a proposito: cada carga de pagina son
varias consultas del backend a la base.

`GET /health` responde el estado del servidor y de la conexion a la base. Es la
primera parada para diagnosticar cualquier fallo en produccion.

## Deuda y pendientes abiertos

Ninguno bloquea hoy. Todos tienen fecha de caducidad.

### Antes de compartir el sitio en serio

- **El backend duerme.** El plan gratuito de Render apaga el servicio a los 15
  minutos sin trafico, y la siguiente visita tarda entre 30 y 60 segundos. Para
  que la disenadora cargue contenido da igual; para ensenarle el sitio a alguien
  a quien se quiere impresionar, no. Salidas: mover las subidas a URLs firmadas
  y pasar el backend a Vercel, o pagar un plan que no duerma
- **El plan Hobby de Vercel es solo para uso no comercial**, y su definicion
  incluye al freelancer que escribe el codigo. Si esto es trabajo pagado, o se
  pasa a Pro o se mueve el frontend a Cloudflare Pages, que si permite uso
  comercial y no tiene tope de trafico
- **El README no tiene captura del panel.** Es lo primero que busca alguien que
  abre un repositorio de portafolio

### Fragilidades conocidas

- **`apiClient` devuelve vacio en silencio** cuando la respuesta no es JSON. En
  el deploy eso convirtio una variable de entorno mal configurada en una pantalla
  en blanco sin pistas, porque el `vercel.json` hace que cualquier ruta responda
  `200` con HTML. Deberia lanzar un error claro
- **No hay tests.** Fue una decision consciente mientras cada cambio pasaba por
  spec y auditoria de diff. Con contenido real cargado, deja de serlo
- Borrar una seccion o cambiar una portada **no borra el archivo en R2**. Con
  este volumen, limpiar a mano cuesta menos que automatizarlo

### Decisiones pospuestas a proposito

- **`tagline`**: cuarta palanca de identidad, fuera para no obligar a la
  disenadora a decidir doce veces mas mientras carga. Se retoma viendo el feed
  lleno
- **Preview por token para borradores**: unico punto de `01_ALCANCE_V1.md` sin
  cerrar. Su caso de uso real —compartir trabajo terminado en privado— ya lo
  cubre `unlisted`; solo falta ensenar un borrador a medias
- **Tipos de bloque `text`, `quote`, `gallery`, `beforeAfter`**: el mapa de
  schemas en `sections.schemas.js` ya esta listo para recibirlos. Se decidio
  empezar solo con `image` porque el contenido real de la disenadora es un
  parrafo corto mas imagenes
- **Fotografia como cuarta categoria**: tiene trabajo fotografico, pero no
  quiere enfocarse ahi por ahora

Nota de prioridad, `2026-08-19`: la v1 esta funcionalmente completa contra los
criterios de [01_ALCANCE_V1.md](../producto/01_ALCANCE_V1.md), con una sola
excepcion, la preview por token, cuyo caso de uso real ya lo cubre `unlisted`.

El riesgo ya no es que falten features: es que **nadie ha usado el producto**.
La disenadora no lo ha tocado y sus doce proyectos siguen en un PDF. Lo que
falta antes de seguir construyendo es meter contenido real, y para eso hace
falta que el sitio no viva solo en una laptop.

Los tests siguen sin existir. Es una decision consciente mientras cada cambio
pasa por spec y auditoria de diff; deja de serlo en cuanto haya contenido real
que se pueda romper.

El proximo corte es de backend nuevo, no de UI. Un proyecto hoy solo tiene metadatos; para que valga la pena publicarlo necesita cuerpo. Las dos opciones son el modulo `media` (Fase 4, ya hay tabla y cliente R2) o el modulo `sections` (Fase 5, ya hay tabla). Conviene `media` primero, porque las secciones de imagen dependen de tener assets.
