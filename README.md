# Mitzuri

Portafolio de una diseñadora, con dos caras: un sitio público que muestra su
trabajo y un CMS privado donde ella lo crea, lo ordena y lo publica sin depender
de nadie.

Monorepo con backend en Node/Express, frontend en React + TypeScript,
PostgreSQL y almacenamiento de imágenes en Cloudflare R2.

**En producción desde agosto de 2026.**

---

## Stack

| Capa | Tecnologías |
| --- | --- |
| Backend | Node.js, Express 5, PostgreSQL (`pg`), Zod 4, JWT, bcrypt, multer |
| Frontend | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4 |
| Base de datos | PostgreSQL 18, migraciones SQL versionadas con checksum |
| Media | Cloudflare R2 vía SDK de S3, servido por dominio propio |
| Tooling | ESLint, nodemon, concurrently |

Sin ORM, sin librería de componentes, sin framework de CSS más allá de Tailwind.

---

## Estructura

```
Mitzuri/
├── backend/
│   ├── src/
│   │   ├── modules/          # auth, projects, media, sections
│   │   ├── shared/           # db, middleware, errors, storage, utils
│   │   ├── app.js
│   │   └── server.js
│   ├── sql/                  # 11 migraciones versionadas
│   └── scripts/              # migrate, seed
├── frontend/
│   └── src/
│       ├── app/admin/        # panel privado
│       ├── app/public/       # sitio público
│       ├── components/ui/    # componentes compartidos
│       ├── services/         # apiClient y uno por feature
│       └── types/
├── docs/                     # documentación del producto y del proceso
└── docker-compose.yml
```

Cada módulo del backend sigue la misma cadena de responsabilidades, sin saltarse
eslabones:

```
routes → controller → service → repository → db
```

- **routes** — endpoints y middleware
- **controller** — lee la request y responde; sin lógica de negocio
- **service** — todas las reglas de negocio
- **repository** — único lugar que habla con la base

---

## Puesta en marcha

Requisitos: Node.js 22+, Docker.

```bash
# 1. dependencias
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. variables de entorno
cp .env.example .env
cp frontend/.env.example frontend/.env

# 3. base de datos
docker compose up -d
npm run db:migrate
npm run db:seed

# 4. desarrollo
npm run dev
```

Backend en `http://localhost:3000`, frontend en `http://localhost:5173`.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | backend y frontend en paralelo |
| `npm run db:migrate` | aplica las migraciones pendientes |
| `npm run db:seed` | crea o actualiza la usuaria administradora |

Dentro de cada paquete: `npm run lint`, y en `frontend/` también `npm run build`.

---

## Variables de entorno

El `.env` de la raíz alimenta al backend y a Docker Compose. El frontend usa su
propio `frontend/.env`, porque Vite solo expone al navegador las variables con
prefijo `VITE_`.

| Variable | Para qué sirve |
| --- | --- |
| `PORT`, `NODE_ENV` | Servidor |
| `DATABASE_URL` o `DB_*` | Conexión a PostgreSQL |
| `POSTGRES_*` | Contenedor de PostgreSQL |
| `JWT_SECRET` | Firma de los tokens de sesión |
| `ADMIN_*` | Usuaria creada por el seed |
| `CLOUDFLARE_*`, `R2_BUCKET` | Credenciales de R2 |
| `R2_PUBLIC_BASE_URL` | Dominio desde el que se sirven las imágenes |
| `FRONTEND_URL` | Orígenes permitidos por CORS, separados por comas |
| `VITE_API_BASE_URL` | URL del API que consume el frontend |

---

## Modelo de publicación

Un proyecto tiene tres estados:

| Estado | Visible en el feed | Accesible por URL |
| --- | --- | --- |
| `draft` | no | no |
| `unlisted` | no | sí |
| `published` | sí | sí |

`unlisted` existe porque la diseñadora comparte trabajo terminado con clientes
antes —o en lugar— de publicarlo. Su página se sirve con `noindex, nofollow`:
sin eso, una URL compartida en privado acabaría en resultados de búsqueda.

Una regla que no se ve pero sostiene todo lo demás: **el `slug` lo deriva el
backend desde el título y se congela en cuanto el proyecto sale de borrador, para
siempre.** Volver a borrador no lo desbloquea. Una dirección que ya pudo
compartirse no se recicla.

---

## API

### Público

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servidor y de la base |
| `GET` | `/projects` | Proyectos publicados, en orden editorial |
| `GET` | `/projects/:slug` | Proyecto publicado o no listado, con sus imágenes |

Un `draft` y un slug inexistente devuelven la misma respuesta, para que no se
pueda averiguar qué borradores existen probando URLs.

### Auth

| Método | Ruta | Auth |
| --- | --- | --- |
| `POST` | `/auth/login` | No |
| `GET` | `/auth/me` | Sí |
| `POST` | `/auth/logout` | Sí |

### Admin

Todas requieren `Authorization: Bearer <token>`.

| Método | Ruta |
| --- | --- |
| `GET` `POST` | `/admin/projects` |
| `GET` `PUT` `DELETE` | `/admin/projects/:id` |
| `POST` | `/admin/projects/:id/publish` · `/unlist` · `/unpublish` |
| `GET` `POST` | `/admin/projects/:id/sections` |
| `PUT` | `/admin/projects/:id/sections/reorder` |
| `PUT` `DELETE` | `/admin/sections/:id` |
| `POST` | `/admin/media` |
| `PUT` | `/admin/media/:id` |

---

## Base de datos

Migraciones numeradas en `backend/sql/`, aplicadas en orden. El runner registra
cada una en `schema_migrations` con un checksum, así que una migración aplicada
no se repite y un archivo modificado después de aplicarse se detecta como error.

En producción corren solas: el script `start` es
`node scripts/migrate.js && node src/server.js`.

Tablas: `users`, `projects`, `sections`, `media_assets`.

---

## Autenticación

Sesión por JWT, con una sola usuaria administradora.

`AuthProvider` mantiene la sesión viva entre recargas:

1. Al arrancar, si hay token guardado se valida contra `GET /auth/me`
2. Mientras se valida el estado es `loading` y los guards no deciden nada, así
   una recarga no expulsa a la usuaria
3. Si el token es válido se pasa a `authenticated`; si no, se limpia
4. Cualquier respuesta `401` cierra la sesión automáticamente

La verdad de la sesión la da el backend, no el token guardado: `getMe` revisa
`is_active`, así que desactivar una cuenta invalida sus tokens en la siguiente
petición.

---

## Sistema visual

Todo el color y la tipografía viven en el bloque `@theme` de `index.css`. **Está
prohibido usar colores literales de Tailwind** en el código: solo tokens. Cambiar
un hex cambia el sitio entero.

Cada proyecto puede tener su color de acento, que dentro de su página sustituye
al azul del sitio redefiniendo la variable CSS. El panel avisa si ese color tiene
menos de 4.5:1 de contraste sobre blanco — avisa, no bloquea.

Las tipografías son self-hosted. La display solo se carga en el sitio público y
solo se usa a 24px o más: tiene un único peso, así que la jerarquía se hace con
tamaño y espaciado.

---

## Estado del proyecto

Funcionando en producción:

- [x] Autenticación admin con sesión persistente
- [x] CRUD de proyectos con tres estados de publicación
- [x] Subida de imágenes a R2 desde el panel
- [x] Galería por proyecto, con reordenamiento
- [x] Feed público en mosaico y página por `slug`
- [x] Metadatos: categoría, herramientas, color de acento y créditos
- [x] SEO básico y `noindex` en proyectos no listados
- [x] Deploy con migraciones automáticas

Pendiente:

- [ ] Tests automatizados
- [ ] Open Graph por proyecto
- [ ] Derivados optimizados de imagen

---

## Documentación

`docs/` no es opcional: es la fuente de verdad del producto y del proceso.

- [`docs/PLAN.md`](docs/PLAN.md) — índice de toda la documentación
- [`docs/dev/00_ESTADO_ACTUAL.md`](docs/dev/00_ESTADO_ACTUAL.md) — qué existe hoy y qué falta
- [`docs/dev/08_COMO_TRABAJAMOS.md`](docs/dev/08_COMO_TRABAJAMOS.md) — el método de trabajo
- [`docs/specs/`](docs/specs) — una spec por tarea, con su razonamiento y sus criterios de aceptación

Las specs son el registro de **por qué** cada cosa está como está: qué problema
resolvía, qué se descartó y con qué criterio se dio por terminada.

---

## Licencia

Proyecto personal. Todos los derechos reservados.
