# Estado actual del repo

Snapshot revisado el `2026-08-11` sobre el working tree actual.

## Resumen ejecutivo

`Mitzuri` ya tiene el CRUD de proyectos conectado de punta a punta: el admin puede listar, crear, editar, publicar, despublicar y eliminar proyectos desde la UI, sin tocar la base.

Los proyectos ahora tienen tres estados. `unlisted` permite compartir un proyecto terminado por URL sin que aparezca en el feed publico, que es como la disenadora trabaja con clientes.

Con eso, Fase 2 queda cerrada. Lo siguiente es el sistema visual y despues media (Fase 4).

## Cambios desde el snapshot anterior (`2026-08-09`)

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

## Lo que ya existe de verdad

### Infraestructura y repo

- [x] Monorepo con `backend/`, `frontend/` y `docs/`.
- [x] `.env` unico en la raiz cargado desde `backend/src/shared/utils/env.js`.
- [x] `docker-compose.yml` para PostgreSQL 15 local.
- [x] Scripts raiz para `dev`, `db:migrate` y `db:seed`.
- [x] `docs/dev` y `docs/producto` ya creados como base de documentacion.

### Backend

- [x] Servidor `Express 5` arrancando desde [backend/src/server.js](../../backend/src/server.js).
- [x] `express.json()` y `cors()` configurados en [backend/src/app.js](../../backend/src/app.js).
- [x] Conexion PostgreSQL con `pg`, usando `DATABASE_URL` o variables discretas.
- [x] Middleware global de errores.
- [x] Middleware de validacion con `zod`.
- [x] Middleware de auth con JWT.
- [x] Modulo `auth` con `login`, `logout` y `me`.
- [x] Modulo `projects` con CRUD y publish/unpublish.
- [x] Utilidad para generar `slug`.
- [x] Cliente S3 para `Cloudflare R2`.
- [x] `404` inline en `app.js`.

### Base de datos

- [x] Runner propio de migraciones SQL con checksum.
- [x] Tabla `schema_migrations`.
- [x] Migraciones para `users`, `projects`, `sections`, `media_assets`, `project_preview_tokens`.
- [x] Script de `seed` para admin local con `upsert` por email.

### Frontend

- [x] App con `React 19 + TypeScript + Vite`.
- [x] `react-router-dom` instalado y usado en [frontend/src/App.tsx](../../frontend/src/App.tsx).
- [x] Cliente HTTP compartido en [frontend/src/services/apiClient.ts](../../frontend/src/services/apiClient.ts), con `ApiError` y deteccion de `401`.
- [x] Servicio de auth en [frontend/src/services/auth.service.ts](../../frontend/src/services/auth.service.ts).
- [x] Storage de token aislado en [frontend/src/services/token.storage.ts](../../frontend/src/services/token.storage.ts).
- [x] Sesion persistente en [frontend/src/app/admin/auth/AuthProvider.tsx](../../frontend/src/app/admin/auth/AuthProvider.tsx): rehidrata contra `GET /auth/me` al cargar la app.
- [x] Guards `ProtectedRoute` y `GuestRoute`, con retorno a la ruta original tras el login.
- [x] Pantalla `LoginPage` en [frontend/src/app/admin/pages/LoginPage.tsx](../../frontend/src/app/admin/pages/LoginPage.tsx).
- [x] `AdminLayout` con usuario de sesion y logout.
- [x] Tailwind 4 con capa de componentes en `src/styles/components.css`.
- [x] Servicio de proyectos en [frontend/src/services/projects.service.ts](../../frontend/src/services/projects.service.ts).
- [x] Listado admin de proyectos con acciones de publicar, despublicar y eliminar.
- [x] Formulario de alta y edicion en [frontend/src/app/admin/pages/ProjectFormPage.tsx](../../frontend/src/app/admin/pages/ProjectFormPage.tsx).
- [x] Build y lint funcionales.

## Lo que cambio frente al snapshot anterior

El snapshot anterior ya quedo desactualizado en estos puntos:

- `admin/projects` ahora si esta protegido con `authMiddleware` en `app.js`
- `GET /auth/me` ya consulta `users` y devuelve datos reales del usuario
- el frontend ya no es solo la pantalla minima de Vite
- `react-router-dom` ya forma parte del stack
- ya existe un `apiClient` reutilizable
- ya existe un flujo base de login admin

## Lo que aun falta o sigue incompleto

### Backend

- [ ] Modulo `sections`.
- [ ] Modulo `media`.
- [ ] Preview privada.
- [ ] Endpoints publicos `/projects`, `/projects/:slug` y `/preview/:token`.
- [ ] Reglas adicionales para publicar si el producto las necesita.
- [ ] Corregir detalles menores de calidad en auth, por ejemplo el typo `"Inavlid token"` en el middleware.

### Frontend

- [ ] Crear servicios de `sections` y `media`.
- [ ] Implementar rutas publicas reales mas alla de `HomePage`.
- [ ] Elegir variante de feed y borrar la maqueta temporal de `/lab`, ver [05_IDENTIDAD_Y_FEED.md](../producto/05_IDENTIDAD_Y_FEED.md).
- [ ] Migracion con los campos de identidad del proyecto, una vez elegida la variante.
- [ ] Renderer de bloques narrativos.

### Calidad y operacion

- [ ] Agregar tests automatizados.
- [ ] Definir CI si se quiere automatizar calidad.
- [ ] Consolidar documentacion de deploy.

## Hallazgos importantes del codigo actual

- `POST /auth/logout` exige token, pero solo responde `{ "message": "Logged out" }`; no invalida JWT. El frontend lo llama best-effort y limpia igual el token local.
- No hay refresh token: el JWT dura `1d` y al vencer el siguiente `401` cierra la sesion. Es aceptable para un admin de una sola persona; si molesta, la solucion es refresh token, no alargar la expiracion.
- El token vive en `localStorage`, asi que un XSS podria leerlo. La alternativa mas segura seria cookie `httpOnly`, pero implica refactor de backend (`cookie-parser`, `set-cookie`, CORS con credenciales). Decision consciente, no descuido.
- `GET /auth/me` ya devuelve usuario real de la tabla `users`, no solo el `userId` del token.
- `frontend/src/components/admin`, `blocks` y `shared` siguen vacios; solo `ui/` tiene contenido.
- `frontend/src/App.css` sigue teniendo restos del starter de Vite.

## Verificacion tecnica realizada

Comprobado el `2026-08-09`:

- [x] `npm run lint --prefix frontend`
- [x] `npm run build --prefix frontend`
- [x] `npm run lint --prefix backend`
- [x] Smoke test HTTP contra el backend local: login, crear con `cover_image_url`, editar, publicar, error de validacion de `year`, y borrar con `204`.

Pendiente de verificar manualmente en navegador: alta, edicion, publicar/despublicar y borrado desde la UI.

## Lectura rapida del momento del proyecto

1. ~~login~~ hecho
2. ~~sesion valida~~ hecho
3. ~~listado de proyectos~~ hecho
4. ~~creacion y edicion base~~ hecho
5. ~~estados de publicacion~~ hecho
6. ~~sistema visual: tokens de color y tipografia~~ hecho
7. contenido del proyecto: media, empezando por la portada
8. secciones
9. rutas publicas de proyectos

El proximo corte es de backend nuevo, no de UI. Un proyecto hoy solo tiene metadatos; para que valga la pena publicarlo necesita cuerpo. Las dos opciones son el modulo `media` (Fase 4, ya hay tabla y cliente R2) o el modulo `sections` (Fase 5, ya hay tabla). Conviene `media` primero, porque las secciones de imagen dependen de tener assets.
