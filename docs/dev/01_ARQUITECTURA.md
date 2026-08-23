# Arquitectura

Revisado el `2026-08-23`, contra el código real del repositorio.

## Flujo general

```
Sitio publico  ─┐
                ├─→  HTTP API (Express)  ─→  PostgreSQL
Panel admin    ─┘                        └─→  Cloudflare R2
```

Las imágenes no pasan por el API al leerse: se suben a través de él, pero se
sirven directo desde `cdn.mitzuri.com`. Lo único que guarda PostgreSQL de una
imagen es su metadata.

## Backend

### Estructura real

```text
backend/
├── Dockerfile
├── eslint.config.js
├── package.json
├── scripts/
│   ├── migrate.js
│   └── seed-dev.js
├── sql/                       # 001 a 011, ver 02_DATOS_Y_API.md
└── src/
    ├── app.js
    ├── server.js
    ├── modules/
    │   ├── auth/              # routes, controller, service, repository, schemas
    │   ├── projects/          # + projects.public.routes.js
    │   ├── media/
    │   └── sections/
    └── shared/
        ├── db/                # pool de pg
        ├── errors/            # AppError y sus cuatro hijos
        ├── middleware/        # auth, validate, error, upload
        ├── storage/           # cliente S3 hacia R2
        └── utils/             # env, slug
```

Los cuatro módulos siguen la misma cadena, sin saltarse eslabones:

```
routes → controller → service → repository → db
```

- **routes** — endpoints y middleware. Nada más
- **controller** — lee la request, responde, `next(error)` en el catch
- **service** — todas las reglas de negocio. Lanza errores de dominio
- **repository** — SQL con `pool.query`. Único lugar que habla con la base

Un controller nunca importa el repository. Un repository nunca lanza errores de
dominio.

**`shared/validators/` no existe como concepto vivo.** La validación acabó
viviendo en el `*.schemas.js` de cada módulo, junto a lo que valida. Si esa
carpeta sigue en tu disco, está vacía y se puede borrar.

### Montaje de la API

En [backend/src/app.js](../../backend/src/app.js), en este orden:

```js
app.use(express.json())
app.get("/")                                        // healthcheck simple
app.use(cors({ origin: allowedOrigins }))           // lista separada por comas
app.get("/health")                                  // + SELECT 1 contra la base
app.use("/auth", authRoutes)
app.use("/admin/projects", authMiddleware, projectSectionsRouter)
app.use("/admin/projects", authMiddleware, projectsRoutes)
app.use("/admin/sections", authMiddleware, sectionsRouter)
app.use("/admin/media",    authMiddleware, mediaRoutes)
app.use("/projects", projectsPublicRoutes)          // sin token
app.use(404 inline)
app.use(errorMiddleware)
```

Todo lo que cuelga de `/admin` pasa por `authMiddleware` en el montaje, no
dentro de cada router. Las rutas públicas van después y sin token.

`errorMiddleware` necesita los cuatro parámetros `(err, req, res, next)` o
Express no lo reconoce como manejador de error. Además traduce los errores de
multer a `ValidationError`, para que un archivo demasiado grande responda `400`
y no `500`.

## Frontend

### Estructura real

```text
frontend/
├── vercel.json                # reescritura de rutas para una SPA
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx               # importa Be Vietnam Pro
    ├── index.css              # @theme con los tokens
    ├── app/
    │   ├── admin/
    │   │   ├── auth/          # AuthProvider, useAuth, ProtectedRoute, GuestRoute
    │   │   ├── layout/        # AdminLayout
    │   │   ├── pages/         # Login, Dashboard, Projects, ProjectForm, ProjectImages
    │   │   └── routes.tsx
    │   └── public/
    │       ├── layout/        # PublicLayout, importa Yeseva One
    │       ├── pages/         # HomePage, ProjectPage
    │       └── routes.tsx
    ├── components/ui/         # Button, Input, Textarea, Select, Card, Cover, ImageUpload
    ├── lib/                   # cn, contrast
    ├── services/              # apiClient, token.storage y uno por feature
    ├── styles/components.css  # clases semanticas con @apply
    └── types/                 # auth, project, media, section
```

`components/admin/`, `components/blocks/` y `components/shared/` se planearon al
principio y nunca se usaron: **todo lo compartido acabó en `components/ui/`**.
Si esas carpetas siguen en tu disco, están vacías y se pueden borrar.

### Rutas

| Ruta | Guard | Pantalla |
| --- | --- | --- |
| `/` | — | Feed público |
| `/proyectos/:slug` | — | Página de proyecto |
| `/admin/login` | `GuestRoute` | Login |
| `/admin` | `ProtectedRoute` | Dashboard |
| `/admin/projects` | `ProtectedRoute` | Listado |
| `/admin/projects/new` | `ProtectedRoute` | Alta |
| `/admin/projects/:id/edit` | `ProtectedRoute` | Edición |
| `/admin/projects/:id/imagenes` | `ProtectedRoute` | Galería |

La galería vive en pantalla aparte del formulario a propósito: el formulario
guarda al presionar un botón y la galería guarda en cada acción. Mezclar dos
modelos de guardado en una pantalla confunde.

### Sesión admin

La sesión vive en un solo provider, no dispersa en cada página:

```
AuthProvider (loading | authenticated | anonymous)
  ├── al montar: si hay token → GET /auth/me → confirma usuario real
  ├── escucha `auth:unauthorized` → cierra sesion sola
  └── expone { user, status, isAuthenticated, login, logout } via useAuth()
```

- el token vive en `localStorage` bajo `mitzuri.token`, encapsulado en
  `services/token.storage.ts`. Ningún otro archivo toca `localStorage`
- el estado `loading` existe para no expulsar al usuario en cada recarga antes
  de saber si su token sirve
- la verdad de la sesión la da el backend, no el token guardado: un token válido
  de una usuaria desactivada no autentica, porque `getMe` revisa `is_active`
- `apiClient` emite `auth:unauthorized` ante un `401`, así el vencimiento del JWT
  cierra la sesión sin que cada pantalla lo maneje
- el contexto vive en `auth.context.ts`, separado del provider, para no romper
  Fast Refresh

Consecuencia: una pantalla admin nueva no necesita lógica de auth. Basta
colgarla bajo `ProtectedRoute` y leer `useAuth()` si necesita a la usuaria.

### Capa HTTP

Todo pasa por `services/apiClient.ts`. Nunca `fetch` directo en un componente.

- lanza `ApiError` con `status`
- si el cuerpo es `FormData`, **no** fija `Content-Type`: lo escribe el
  navegador, porque incluye el `boundary` que separa las partes del multipart
- un servicio por feature, con `BASE_PATH` como constante arriba

**Fragilidad conocida:** cuando la respuesta no es JSON, `apiClient` devuelve
vacío en silencio en vez de lanzar un error. Combinado con la reescritura de
rutas de `vercel.json` —que hace que cualquier ruta desconocida responda `200`
con HTML— eso convierte una URL mal configurada en una pantalla en blanco sin
pistas. Ya pasó una vez durante el deploy.

## Base de datos

- SQL manual versionado en `backend/sql/`
- runner propio en `backend/scripts/migrate.js`, que registra cada archivo en
  `schema_migrations` con checksum
- una migración ya aplicada no se repite, y un archivo modificado después de
  aplicarse se detecta como error
- sin ORM

En producción las migraciones corren solas: el script `start` del backend es
`node scripts/migrate.js && node src/server.js`.

## Storage de media

```
navegador → POST /admin/media (multipart) → backend
                                              ├→ valida mime y tamano
                                              ├→ lee ancho y alto del buffer
                                              ├→ sube a R2 con PutObject
                                              └→ INSERT en media_assets
```

El archivo nunca toca disco: `multer` con `memoryStorage` lo deja en memoria y
de ahí va directo a R2. La clave es `media/{uuid}.{ext}`, con la extensión
derivada del mime y no del nombre que manda el cliente.

La lectura no pasa por el backend: `R2_PUBLIC_BASE_URL` apunta a
`cdn.mitzuri.com`, que sirve el bucket directamente.

**Límites aceptados a propósito**, dado el volumen del proyecto: subir una
imagen y no guardar deja el archivo huérfano, reemplazar una portada no borra la
anterior, y borrar un proyecto no borra sus archivos.

## Producción

| Pieza | Servicio |
| --- | --- |
| Frontend | Vercel |
| API | Render, mismo región que la base |
| Base | Neon, Postgres 18 |
| Imágenes | Cloudflare R2 |

Detalles de configuración y sus trampas: [docs/specs/08_deploy.md](../specs/08_deploy.md).
