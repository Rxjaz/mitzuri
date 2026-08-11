# Datos y API

## Schema actual de base de datos

### `users`

Estado:

- existe en migracion real y se usa en auth

Campos:

- `id UUID PRIMARY KEY`
- `email TEXT UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `full_name TEXT`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `last_login_at TIMESTAMP`

Uso real hoy:

- `login` busca por email
- `me` busca por id
- `seed-dev.js` hace upsert del admin por email

### `projects`

Estado:

- existe en migracion real y se usa en CRUD admin

Campos:

- `id UUID PRIMARY KEY`
- `title TEXT NOT NULL`
- `slug TEXT UNIQUE NOT NULL`
- `description TEXT NOT NULL`
- `cover_image_url TEXT`
- `status TEXT NOT NULL DEFAULT 'draft'`
- `year INT NOT NULL`
- `client TEXT`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `published_at TIMESTAMP`

Restricciones reales:

- `status` solo acepta `draft` o `published`
- `published_at` solo puede existir si `status = 'published'`

Indices reales:

- `idx_projects_slug`
- `idx_projects_status`

### `sections`

Estado:

- la tabla existe
- el modulo backend aun no existe

Campos:

- `id UUID PRIMARY KEY`
- `project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
- `type TEXT NOT NULL`
- `content JSONB NOT NULL`
- `position INT NOT NULL`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`

Restricciones reales:

- `position > 0`
- indice unico por `project_id, position`

### `media_assets`

Estado:

- la tabla existe
- el flujo de media aun no existe

Campos:

- `id UUID PRIMARY KEY`
- `original_url TEXT NOT NULL`
- `optimized_url TEXT`
- `alt_text TEXT`
- `mime_type TEXT NOT NULL`
- `width INT`
- `height INT`
- `file_size_bytes BIGINT`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`

Restriccion real:

- `file_size_bytes` no puede ser negativo

### `project_preview_tokens`

Estado:

- la tabla existe
- la preview aun no existe

Campos:

- `id UUID PRIMARY KEY`
- `project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
- `token TEXT UNIQUE NOT NULL`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `expires_at TIMESTAMP`

Indices reales:

- `idx_preview_tokens_project_id`
- `idx_preview_tokens_token`

---

## API real implementada hoy

### Auth

- [x] `POST /auth/login`
- [x] `POST /auth/logout`
- [x] `GET /auth/me`

Comportamiento actual:

- `login` valida body con `zod`
- busca usuario por email
- compara password con `bcrypt`
- genera JWT con expiracion de `1d`
- devuelve `user` y `token`

Forma actual de `POST /auth/login`:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "full_name": "Admin"
  },
  "token": "jwt"
}
```

Forma actual de `GET /auth/me`:

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "full_name": "Admin",
  "is_active": true,
  "created_at": "2026-05-28T00:00:00.000Z"
}
```

Limitaciones actuales:

- `logout` no invalida JWT
- `login` no actualiza `last_login_at`
- el payload JWT actual solo contiene `userId`

### Admin projects

- [x] `GET /admin/projects`
- [x] `POST /admin/projects`
- [x] `GET /admin/projects/:id`
- [x] `PUT /admin/projects/:id`
- [x] `DELETE /admin/projects/:id`
- [x] `POST /admin/projects/:id/publish`
- [x] `POST /admin/projects/:id/unpublish`

Estado importante:

- estas rutas ya estan protegidas por `authMiddleware` desde `app.js`

Comportamiento actual:

- crea `slug` automaticamente si no se envia
- al actualizar, regenera `slug` desde `title` si mandas nuevo titulo sin slug
- `publish` y `unpublish` verifican que el proyecto exista

### API aun faltante

- [ ] `POST /admin/projects/:id/sections`
- [ ] `PUT /admin/sections/:sectionId`
- [ ] `DELETE /admin/sections/:sectionId`
- [ ] `POST /admin/projects/:id/sections/reorder`
- [ ] `POST /admin/media`
- [ ] `GET /admin/media/:id`
- [ ] `DELETE /admin/media/:id`
- [ ] `POST /admin/projects/:id/preview-token`
- [ ] `DELETE /admin/projects/:id/preview-token`
- [ ] `GET /projects`
- [ ] `GET /projects/:slug`
- [ ] `GET /preview/:token`

---

## Integracion frontend ya existente

La documentacion tecnica ya debe asumir esto como realidad:

- `frontend/src/services/apiClient.ts` concentra `GET`, `POST`, `PUT`, `DELETE`
- el token se guarda en `localStorage` bajo la key `token`
- `apiClient` toma base URL desde `VITE_API_BASE_URL`
- `frontend/src/services/auth.service.ts` ya consume `/auth/login` y `/auth/me`

Eso reduce el trabajo pendiente del frontend a:

- endurecer el flujo de sesion
- agregar guardas y layouts
- conectar `projects`

## Contratos de contenido objetivo para secciones

Aunque aun no estan implementados en codigo, estos contratos siguen siendo la referencia de v1.

### `heading`

```json
{
  "text": "El reto",
  "level": 2,
  "align": "left"
}
```

### `text`

```json
{
  "title": "Contexto",
  "body": "Texto principal del bloque",
  "align": "left",
  "maxWidth": "narrow"
}
```

### `image`

```json
{
  "mediaId": "uuid",
  "caption": "Aplicacion final",
  "layout": "full",
  "alt": "Poster del proyecto"
}
```

### `beforeAfter`

```json
{
  "beforeMediaId": "uuid",
  "afterMediaId": "uuid",
  "beforeLabel": "Antes",
  "afterLabel": "Despues",
  "caption": "Comparacion principal"
}
```

### `gallery`

```json
{
  "items": [
    { "mediaId": "uuid-1", "alt": "Mockup 1", "caption": "Vista 1" },
    { "mediaId": "uuid-2", "alt": "Mockup 2", "caption": "Vista 2" }
  ],
  "layout": "grid-2"
}
```

## Reglas de datos que se mantienen

- ningun bloque debe depender de campos ambiguos como `data`, `payload`, `extra` o `config` sin schema claro
- el orden de secciones es parte del producto
- `slug` debe ser unico
- los borradores no deben salir en publico
- no editar migraciones ya aplicadas; agregar una nueva
