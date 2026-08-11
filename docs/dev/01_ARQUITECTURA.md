# Arquitectura

## Flujo general

Arquitectura objetivo de producto:

`Frontend publico/admin -> HTTP API -> Backend -> PostgreSQL + R2`

Arquitectura real hoy:

`Frontend admin minimo -> Backend Express -> PostgreSQL`

R2 existe como cliente configurado, pero todavia no como flujo funcional.

## Backend

### Estructura real

```text
backend/
|-- package.json
|-- eslint.config.js
|-- Dockerfile
|-- scripts/
|   |-- migrate.js
|   `-- seed-dev.js
|-- sql/
|   |-- 001_extensions.sql
|   |-- 002_users.sql
|   |-- 003_projects.sql
|   |-- 004_sections.sql
|   |-- 005_media_assets.sql
|   `-- 006_project_preview_tokens.sql
`-- src/
    |-- app.js
    |-- server.js
    |-- modules/
    |   |-- auth/
    |   |   |-- auth.routes.js
    |   |   |-- auth.controller.js
    |   |   |-- auth.service.js
    |   |   |-- auth.repository.js
    |   |   `-- auth.schemas.js
    |   |-- projects/
    |   |   |-- projects.routes.js
    |   |   |-- projects.controller.js
    |   |   |-- projects.service.js
    |   |   |-- projects.repository.js
    |   |   `-- projects.schemas.js
    |   |-- media/
    |   `-- sections/
    `-- shared/
        |-- db/
        |-- errors/
        |-- middleware/
        |-- storage/
        |-- utils/
        `-- validators/
```

### Capas que ya estan vivas

- `routes`: define endpoints y middlewares por modulo
- `controller`: traduce request/response
- `service`: reglas de negocio
- `repository`: acceso SQL
- `shared`: infraestructura comun

`auth` y `projects` ya siguen esa convencion. `media` y `sections` aun son huecos estructurales.

### Montaje real de la API

En [backend/src/app.js](../../backend/src/app.js):

- `GET /`
- `app.use("/auth", authRoutes)`
- `app.use("/admin/projects", authMiddleware, projectsRoutes)`
- `404` inline
- `errorMiddleware` al final

Eso significa que el corte actual del backend es:

- auth admin funcional
- CRUD admin de proyectos funcional
- nada mas montado hacia fuera

## Frontend

### Estructura real

```text
frontend/
|-- package.json
|-- eslint.config.js
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.node.json
|-- vite.config.ts
|-- public/
|   |-- favicon.svg
|   `-- icons.svg
`-- src/
    |-- App.tsx
    |-- App.css
    |-- index.css
    |-- main.tsx
    |-- app/
    |   |-- admin/
    |   |   |-- auth/
    |   |   |   |-- auth.context.ts
    |   |   |   |-- AuthProvider.tsx
    |   |   |   |-- useAuth.ts
    |   |   |   |-- ProtectedRoute.tsx
    |   |   |   `-- GuestRoute.tsx
    |   |   |-- layout/
    |   |   |   `-- AdminLayout.tsx
    |   |   |-- pages/
    |   |   |   |-- LoginPage.tsx
    |   |   |   `-- DashboardPage.tsx
    |   |   `-- routes.tsx
    |   `-- public/
    |       |-- layout/
    |       |-- pages/
    |       `-- routes.tsx
    |-- components/
    |   |-- admin/
    |   |-- blocks/
    |   |-- shared/
    |   `-- ui/
    |-- services/
    |   |-- apiClient.ts
    |   |-- auth.service.ts
    |   `-- token.storage.ts
    |-- styles/
    |-- types/
    |   `-- auth.ts
    `-- assets/
```

### Montaje real de la app

[frontend/src/App.tsx](../../frontend/src/App.tsx) monta `BrowserRouter` -> `AuthProvider` -> `Routes`, y delega los arboles de rutas a `app/admin/routes.tsx` y `app/public/routes.tsx`.

Rutas actuales:

- `/` -> `PublicLayout` + `HomePage`
- `/admin/login` -> `GuestRoute` + `LoginPage`
- `/admin` -> `ProtectedRoute` + `AdminLayout` + `DashboardPage`

### Arquitectura de sesion admin

La sesion vive en un unico provider, no dispersa en cada pagina:

```
AuthProvider (estado: loading | authenticated | anonymous)
  |-- al montar: si hay token -> GET /auth/me -> confirma usuario real
  |-- escucha el evento `auth:unauthorized` -> cierra sesion sola
  `-- expone { user, status, isAuthenticated, login, logout } via useAuth()
```

Decisiones que sostienen esto:

- el token se guarda en `localStorage` bajo la clave `mitzuri.token`, encapsulada en
  [frontend/src/services/token.storage.ts](../../frontend/src/services/token.storage.ts); ningun otro archivo toca `localStorage` directo
- el estado `loading` existe para no expulsar al usuario en cada recarga antes de saber si su token sirve
- la verdad de la sesion la da el backend (`/auth/me`), no el token guardado: un token valido de un usuario desactivado no autentica
- `apiClient` lanza `ApiError` con `status` y emite `auth:unauthorized` ante un `401`, de forma que el vencimiento del JWT cierra la sesion sin que cada pantalla lo maneje
- el contexto vive en `auth.context.ts` separado del provider para no romper Fast Refresh

Consecuencia arquitectonica: cualquier pantalla admin nueva no necesita logica de auth. Basta colgarla bajo `ProtectedRoute` y leer `useAuth()` si necesita el usuario.

### Piezas ya decididas de facto

- `react-router-dom` para navegacion
- `fetch` nativo envuelto en `apiClient`
- `localStorage` para guardar JWT, aislado en `token.storage.ts`
- estructura por `app/admin` y `app/public`
- guard de rutas privadas con `ProtectedRoute` / `GuestRoute`
- Tailwind 4 con clases de componente en `src/styles/components.css`

### Piezas aun no cerradas

- servicios por feature fuera de auth
- tipos de dominio mas alla de `auth.ts`
- renderer de bloques narrativos
- pantallas admin de proyectos
- frontend publico real

## Base de datos

### Estrategia actual

- SQL manual versionado en `backend/sql/`
- runner propio en [backend/scripts/migrate.js](../../backend/scripts/migrate.js)
- deteccion de migraciones editadas por checksum
- sin ORM

### Fuente de verdad

La fuente de verdad del schema sigue siendo:

- `backend/sql/*.sql`
- `schema_migrations`
- `backend/scripts/migrate.js`

## Storage de media

La arquitectura ya apunta a storage externo:

- cliente S3 hacia `Cloudflare R2`
- metadata en `media_assets`

Pero hoy faltan:

- endpoint de subida
- asociacion real con proyectos y secciones
- naming strategy
- optimizacion y derivados

## Implicacion arquitectonica para el siguiente paso

El repo ya no necesita otra ronda de "estructura vacia". Necesita cerrar un slice vertical pequeno y util. Arquitectonicamente, el siguiente corte natural es:

`auth estable -> shell admin -> proyectos en UI -> base visual reusable`

Actualizacion `2026-07-27`: los dos primeros tramos ya estan cerrados. El corte siguiente es `projects.service.ts` en frontend + pantalla de listado de proyectos bajo `ProtectedRoute`.

Por eso Tailwind tiene sentido ahora solo si entra como soporte de ese slice, no como tarea aislada de cosmetica.