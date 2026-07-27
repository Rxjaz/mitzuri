# Mitzuri

Plataforma web para publicar y administrar proyectos: un sitio público que muestra el trabajo, y un panel de administración privado donde se crea, edita y publica ese contenido.

Monorepo con backend en Node/Express, frontend en React + TypeScript y PostgreSQL como base de datos.

---

## Stack

| Capa       | Tecnologías                                                     |
| ---------- | --------------------------------------------------------------- |
| Backend    | Node.js, Express 5, PostgreSQL (`pg`), Zod, JWT, bcrypt          |
| Frontend   | React 19, TypeScript, Vite, React Router, Tailwind CSS 4         |
| Base datos | PostgreSQL 15 (Docker Compose), migraciones SQL versionadas      |
| Media      | Cloudflare R2 vía SDK de S3                                      |
| Tooling    | ESLint, nodemon, concurrently                                    |

---

## Estructura

```
Mitzuri/
├── backend/
│   ├── src/
│   │   ├── modules/          # auth, projects (routes → controller → service → repository)
│   │   ├── shared/           # db, middleware, errors, storage, utils
│   │   ├── app.js
│   │   └── server.js
│   ├── sql/                  # migraciones versionadas
│   └── scripts/              # migrate, seed
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── admin/        # panel privado: auth, layout, páginas, rutas
│       │   └── public/       # sitio público
│       ├── components/       # ui compartida
│       ├── services/         # apiClient y servicios por feature
│       └── types/
└── docker-compose.yml
```

Cada módulo del backend sigue la misma cadena de responsabilidades:

```
routes → controller → service → repository → db
```

- **routes**: define endpoints y aplica middleware (validación, auth)
- **controller**: lee la request y responde; no tiene lógica de negocio
- **service**: reglas de negocio
- **repository**: acceso a la base de datos

---

## Puesta en marcha

Requisitos: Node.js 22+, Docker (para PostgreSQL).

```bash
# 1. dependencias
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. variables de entorno
cp .env.example .env                    # backend + docker
cp frontend/.env.example frontend/.env  # frontend
# completar los valores en ambos

# 3. base de datos
docker compose up -d
npm run db:migrate
npm run db:seed            # crea el usuario admin inicial

# 4. desarrollo (backend + frontend en paralelo)
npm run dev
```

Por defecto el backend queda en `http://localhost:3000` y el frontend en `http://localhost:5173`.

### Scripts

| Comando              | Qué hace                                       |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Levanta backend y frontend a la vez            |
| `npm run db:migrate` | Aplica las migraciones SQL pendientes          |
| `npm run db:seed`    | Crea/actualiza el usuario admin de desarrollo  |

Dentro de cada paquete: `npm run lint`, y en `frontend/` también `npm run build`.

---

## Variables de entorno

El `.env` de la raíz alimenta al backend y a Docker Compose. El frontend usa su propio `frontend/.env`, porque Vite solo expone al navegador las variables con prefijo `VITE_`.

**Raíz** — ver [`.env.example`](.env.example):

| Variable                  | Para qué sirve                                  |
| ------------------------- | ----------------------------------------------- |
| `PORT`, `NODE_ENV`        | Servidor                                        |
| `DB_*` / `DATABASE_URL`   | Conexión a PostgreSQL                           |
| `POSTGRES_*`              | Contenedor de PostgreSQL                        |
| `JWT_SECRET`              | Firma de los tokens de sesión                   |
| `PREVIEW_TOKEN_SECRET`    | Tokens de preview privada                       |
| `ADMIN_*`                 | Usuario admin creado por el seed                |
| `CLOUDFLARE_*`, `R2_*`    | Storage de media                                |
| `FRONTEND_URL`            | Origen permitido por CORS                       |

**Frontend** — ver [`frontend/.env.example`](frontend/.env.example):

| Variable                  | Para qué sirve                                  |
| ------------------------- | ----------------------------------------------- |
| `VITE_API_BASE_URL`       | URL del API que consume el frontend             |

---

## Autenticación

El panel de administración usa sesión por JWT.

```
POST /auth/login   → { user, token }   valida credenciales con bcrypt y firma un JWT
GET  /auth/me      → user              devuelve el usuario del token
POST /auth/logout                      cierra la sesión del lado del cliente
```

En el frontend, `AuthProvider` mantiene la sesión viva entre recargas:

1. Al arrancar la app, si hay token guardado se valida contra `GET /auth/me`.
2. Mientras se valida, el estado es `loading` y los guards no deciden nada — así una recarga no expulsa al usuario.
3. Si el token es válido se pasa a `authenticated`; si no, se limpia y se pasa a `anonymous`.
4. Si cualquier petición responde `401`, la sesión se cierra automáticamente.

Rutas: `ProtectedRoute` protege `/admin` y recuerda a dónde iba el usuario para devolverlo ahí tras el login; `GuestRoute` evita mostrar el login a alguien que ya tiene sesión.

---

## API

### Público

| Método | Ruta   | Descripción     |
| ------ | ------ | --------------- |
| `GET`  | `/`    | Healthcheck     |

### Auth

| Método | Ruta            | Auth | Descripción                |
| ------ | --------------- | ---- | -------------------------- |
| `POST` | `/auth/login`   | No   | Inicia sesión              |
| `GET`  | `/auth/me`      | Sí   | Usuario de la sesión       |
| `POST` | `/auth/logout`  | Sí   | Cierra sesión              |

### Proyectos (admin)

Todas requieren `Authorization: Bearer <token>`.

| Método   | Ruta                            | Descripción              |
| -------- | ------------------------------- | ------------------------ |
| `GET`    | `/admin/projects`               | Listar                   |
| `POST`   | `/admin/projects`               | Crear                    |
| `GET`    | `/admin/projects/:id`           | Detalle                  |
| `PUT`    | `/admin/projects/:id`           | Actualizar               |
| `DELETE` | `/admin/projects/:id`           | Eliminar                 |
| `POST`   | `/admin/projects/:id/publish`   | Publicar                 |
| `POST`   | `/admin/projects/:id/unpublish` | Despublicar              |

---

## Base de datos

Las migraciones viven en `backend/sql/` y se aplican en orden por nombre de archivo. El runner registra cada una en la tabla `schema_migrations` con un checksum, así que una migración ya aplicada no se repite y un archivo modificado después de aplicarse se detecta como error.

Tablas actuales: `users`, `projects`, `sections`, `media_assets`, `project_preview_tokens`.

Para agregar una migración, crear el siguiente archivo numerado en `backend/sql/` y ejecutar `npm run db:migrate`.

---

## Estado del proyecto

En desarrollo activo. Funcionando hoy:

- [x] Autenticación admin con JWT y sesión persistente
- [x] Guards de rutas en el panel
- [x] CRUD de proyectos con publish/unpublish
- [x] Migraciones y seed
- [ ] Módulos de secciones y media
- [ ] Endpoints públicos de proyectos
- [ ] Preview privada
- [ ] Sitio público completo
- [ ] Tests automatizados

---

## Licencia

Proyecto personal. Todos los derechos reservados.
