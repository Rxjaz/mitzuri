# Datos y API

Revisado el `2026-08-23`, contra las once migraciones y el código real.

## Migraciones

| Archivo | Qué hizo |
| --- | --- |
| `001_extensions.sql` | `pgcrypto`, para `gen_random_uuid()` |
| `002_users.sql` | tabla `users` |
| `003_projects.sql` | tabla `projects` |
| `004_sections.sql` | tabla `sections` |
| `005_media_assets.sql` | tabla `media_assets` |
| `006_project_preview_tokens.sql` | tabla `project_preview_tokens` |
| `007_project_unlisted.sql` | tercer estado y `slug_locked` |
| `008_project_sort_order.sql` | orden editorial del feed |
| `009_sections_deferrable_position.sql` | restricción diferible para poder reordenar |
| `010_project_cover_media.sql` | la portada pasa a ser llave foránea |
| `011_project_metadata.sql` | categoría, herramientas, acento y créditos |

Nunca se edita una migración ya aplicada: el checksum falla. Para cambiar algo,
se crea el siguiente archivo numerado.

---

## Schema

### `users`

- `id UUID PRIMARY KEY`
- `email TEXT UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `full_name TEXT`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at`, `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `last_login_at TIMESTAMP`

`login` busca por email, `me` por id, y `seed-dev.js` hace upsert por email.

`is_active` sí se respeta: tanto `login` como `getMe` rechazan a una usuaria
desactivada, así que un token válido deja de servir si se desactiva la cuenta.

**`last_login_at` nunca se escribe.** La columna existe y siempre está en `NULL`.

### `projects`

- `id UUID PRIMARY KEY`
- `title TEXT NOT NULL`
- `slug TEXT UNIQUE NOT NULL`
- `slug_locked BOOLEAN NOT NULL DEFAULT false`
- `description TEXT NOT NULL`
- `cover_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL`
- `status TEXT NOT NULL DEFAULT 'draft'`
- `sort_order INT NOT NULL DEFAULT 0`
- `year INT NOT NULL`
- `client TEXT`
- `category TEXT`
- `tools TEXT[] NOT NULL DEFAULT '{}'`
- `accent_color TEXT`
- `credits TEXT`
- `created_at`, `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `published_at TIMESTAMP`

Restricciones:

- `status IN ('draft', 'unlisted', 'published')`
- `published_at IS NULL OR status <> 'draft'`
- `category IS NULL OR category IN ('editorial', 'marca', 'ilustracion')`
- `accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$'`

Ese último `CHECK` no es cosmético: el hex entra tal cual como variable CSS en el
atributo `style` de la página pública, así que cualquier otro formato sería una
inyección. Se valida en Zod **y** en la base.

Índices: `slug`, `status`, `sort_order`, `category`, `cover_media_id`.

`cover_image_url` **ya no existe**. La portada es una referencia a
`media_assets`, para que el proyecto conozca su ancho, su alto y su texto
alternativo.

### `sections`

- `id UUID PRIMARY KEY`
- `project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
- `type TEXT NOT NULL`
- `content JSONB NOT NULL`
- `position INT NOT NULL`
- `created_at`, `updated_at`

Restricciones:

- `position > 0`
- `UNIQUE (project_id, position) DEFERRABLE INITIALLY DEFERRED`

Lo de **diferible** es esencial. Reordenar mueve varias posiciones a la vez, y un
índice único normal se valida fila por fila: a mitad de la operación dos filas
chocan aunque el estado final sea válido. Diferida, la restricción se comprueba
al cerrar la transacción y el reordenamiento funciona sin trucos.

### `media_assets`

- `id UUID PRIMARY KEY`
- `original_url TEXT NOT NULL`
- `optimized_url TEXT`
- `alt_text TEXT`
- `mime_type TEXT NOT NULL`
- `width INT`, `height INT`
- `file_size_bytes BIGINT`
- `created_at`

`file_size_bytes` no puede ser negativo.

**`optimized_url` siempre está en `NULL`.** No se generan derivados; la columna
está reservada para cuando haga falta.

### `project_preview_tokens`

**Tabla muerta.** Existe desde la migración `006` y nunca se usó.

Se creó para compartir trabajo sin publicarlo, y ese caso lo resolvió el estado
`unlisted`: un proyecto terminado tiene URL permanente y no aparece en el feed.
Un token temporal y revocable resultaba más complicado y menos útil.

Decisión cerrada el `2026-08-23`: **no se va a implementar.** La tabla debería
eliminarse en una migración futura.

---

## API

### Público, sin token

| Método | Ruta | Devuelve |
| --- | --- | --- |
| `GET` | `/` | `"API Running"` |
| `GET` | `/health` | estado del servidor y de la base |
| `GET` | `/projects` | los `published`, ordenados |
| `GET` | `/projects/:slug` | un `published` o `unlisted`, con sus secciones |

Los dos últimos seleccionan **columnas explícitas**, nunca `SELECT *`: el
repositorio es público y un endpoint sin auth no debe devolver columnas internas.

`GET /projects/:slug` sí incluye `status`, porque la página lo necesita para
decidir si lleva `noindex`. Un `draft` nunca sale por esa puerta, y da la
**misma** respuesta que un slug inexistente — si se distinguieran, cualquiera
podría averiguar qué borradores existen probando URLs.

Orden del feed:

```sql
ORDER BY sort_order ASC, published_at DESC NULLS LAST, created_at DESC
```

### Auth

| Método | Ruta | Auth |
| --- | --- | --- |
| `POST` | `/auth/login` | no |
| `GET` | `/auth/me` | sí |
| `POST` | `/auth/logout` | sí |

`login` valida con Zod, compara con bcrypt, revisa `is_active` y firma un JWT de
un día cuyo payload solo lleva `userId`.

`logout` no invalida el JWT del lado del servidor; el frontend limpia el token
local. Es una decisión consciente para una sola administradora.

### Proyectos, admin

Todas con `Authorization: Bearer <token>`.

| Método | Ruta |
| --- | --- |
| `GET` | `/admin/projects` |
| `POST` | `/admin/projects` |
| `GET` | `/admin/projects/:id` |
| `PUT` | `/admin/projects/:id` |
| `DELETE` | `/admin/projects/:id` |
| `POST` | `/admin/projects/:id/publish` |
| `POST` | `/admin/projects/:id/unlist` |
| `POST` | `/admin/projects/:id/unpublish` |

El `slug` nunca lo manda el cliente: siempre lo deriva el backend desde el
título. `PUT` no puede cambiar `status`, `published_at` ni `slug_locked`; eso
solo cambia por las tres acciones dedicadas.

### Secciones, admin

| Método | Ruta |
| --- | --- |
| `GET` | `/admin/projects/:projectId/sections` |
| `POST` | `/admin/projects/:projectId/sections` |
| `PUT` | `/admin/projects/:projectId/sections/reorder` |
| `PUT` | `/admin/sections/:id` |
| `DELETE` | `/admin/sections/:id` |

El reorden recibe `{ "ids": [...] }` y exige que sean **exactamente** las
secciones de ese proyecto, ni más ni menos. Sin esa comprobación se podrían
colar ids de otro proyecto y corromper el orden. Al borrar, las posiciones se
renumeran para no dejar huecos.

### Media, admin

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| `POST` | `/admin/media` | `multipart/form-data`: `file`, `alt_text` opcional |
| `PUT` | `/admin/media/:id` | `{ "alt_text": "..." }` |

Formatos aceptados: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
Máximo 10 MB. **`image/svg+xml` queda fuera a propósito**, porque un SVG puede
llevar scripts.

---

## Estados de un proyecto

```
draft      solo visible en el admin
unlisted   accesible por URL, no aparece en el feed
published  accesible por URL y visible en el feed
```

Todas las transiciones son válidas. Y una regla que no se ve pero importa:
**salir de `draft` bloquea el slug para siempre.** Volver a borrador no lo
desbloquea. Una URL que ya pudo compartirse no se recicla.

---

## Contratos de contenido

### `image` — implementado

```json
{
  "url": "https://cdn.mitzuri.com/media/uuid.jpg",
  "alt": "Doble pagina del libro abierta",
  "caption": null,
  "width": 2000,
  "height": 1333
}
```

`alt` es **obligatorio**: una imagen sin texto alternativo no existe para un
buscador ni para quien usa lector de pantalla, y esto es un portafolio visual.

`width` y `height` vienen de la subida y sirven para reservar el espacio antes
de que la imagen cargue, para que el layout no salte.

El contenido se guarda en el bloque y no como referencia a `media_assets`. Es
denormalizado a propósito: la página pública se arma con una sola consulta.

### `text` — previsto, no implementado

```json
{
  "body": "Texto del bloque",
  "align": "left"
}
```

Único tipo adicional contemplado. El mapa de schemas en `sections.schemas.js`
está hecho para recibirlo: agregar un tipo es agregar una entrada, no tocar la
lógica de validación.

**`heading`, `beforeAfter` y `gallery` quedaron fuera** el `2026-08-23`. El
contenido real de la diseñadora es un párrafo corto más imágenes; esos tres
tipos no tenían caso de uso y multiplicaban los casos de render.

---

## Reglas de datos vigentes

- ningún bloque debe depender de campos ambiguos como `data`, `payload` o
  `config` sin schema claro
- el orden de secciones es parte del producto
- el `slug` es único y se congela al salir de borrador
- un `draft` nunca sale por un endpoint público
- no se editan migraciones ya aplicadas
- los endpoints públicos declaran sus columnas
