# Spec 05 — Galería de imágenes por proyecto

Estado: listo para ejecutar
Alcance: módulo `sections` limitado al tipo `image`, admin de galería, render público
Fuera de alcance: otros tipos de bloque, categorías, `accent_color`, preview por token

---

## Objetivo

El sitio público se ve genérico porque un proyecto solo tiene portada y un
párrafo. El trabajo real de Samira son tres a cinco imágenes por proyecto:
maquetas en contexto, dobles páginas, piezas aplicadas.

Al terminar esta tarea, un proyecto tiene una galería ordenada y el sitio deja
de ser una plantilla con texto.

## Por qué se usa `sections` y no una tabla nueva

La tabla `sections` ya existe, con `type`, `content JSONB` y `position`. Una
galería es una secuencia de bloques de tipo `image`.

Usarla ahora significa que **el sistema de bloques ya queda construido** — CRUD,
orden, validación por tipo. Cuando haga falta un tipo `text` o `quote`, se
agrega un schema más y nada se reescribe. Una tabla `project_images` aparte
obligaría a migrar todo después.

**En esta tarea solo existe el tipo `image`.** Cualquier otro `type` se rechaza.

---

## Migración — `backend/sql/009_sections_deferrable_position.sql`

Hay una trampa real en el schema actual. `idx_sections_project_position` es un
índice único sobre `(project_id, position)`, y se valida **fila por fila**.
Reordenar significa mover varias posiciones a la vez, así que a mitad de la
operación dos filas chocan y Postgres rechaza el `UPDATE`, aunque el estado
final sea válido.

La solución es una restricción diferible: se valida al cerrar la transacción,
no en cada fila.

```sql
DROP INDEX IF EXISTS idx_sections_project_position;

ALTER TABLE sections
    ADD CONSTRAINT sections_project_position_unique
    UNIQUE (project_id, position) DEFERRABLE INITIALLY DEFERRED;
```

**No inventes otra solución.** Nada de posiciones temporales con números
grandes, ni de borrar y reinsertar. Si esta migración falla, para y avisa.

---

## Forma del contenido

Para `type = "image"`, el `content` es:

```json
{
  "url": "https://cdn.mitzuri.com/media/uuid.jpg",
  "alt": "Doble pagina del libro de texto abierta",
  "caption": null,
  "width": 2000,
  "height": 1333
}
```

- `url` — obligatoria
- `alt` — obligatorio, mínimo 1 carácter. **No es opcional**: es un portafolio
  de trabajo visual, y una imagen sin texto alternativo no existe para un
  buscador ni para alguien que usa lector de pantalla
- `caption` — opcional, puede ser `null`
- `width` y `height` — opcionales, vienen de la subida. Sirven para reservar el
  espacio de la imagen antes de que cargue y evitar que el layout salte

Guardar `alt`, `width` y `height` aquí cierra dos deudas abiertas: el texto
alternativo deja de ser inalcanzable desde el proyecto, y la página pública
recupera las proporciones sin necesitar llave foránea a `media_assets`.

---

## Backend — módulo `sections`

`backend/src/modules/sections/`, con la cadena de siempre.

### `sections.schemas.js`

Un schema por tipo, en un mapa. Hoy solo hay una entrada:

```js
const contentSchemas = {
  image: z.object({
    url: z.url(),
    alt: z.string().min(1, "Alt text is required"),
    caption: z.string().nullable().optional(),
    width: z.number().int().positive().nullable().optional(),
    height: z.number().int().positive().nullable().optional(),
  }),
};
```

El schema de creación valida que `type` esté en ese mapa y aplica el schema de
contenido que corresponda. Así, agregar un tipo nuevo en el futuro es agregar
una entrada, no tocar la lógica.

También un schema para el reorden: array de UUIDs, mínimo uno.

### `sections.repository.js`

- `getByProject(projectId)` — ordenado por `position ASC`
- `getById(id)`
- `create(projectId, type, content, position)`
- `update(id, content)` — solo `content` y `updated_at`. `type`, `position` y
  `project_id` no se tocan por esta vía
- `remove(id)`
- `getMaxPosition(projectId)` — para saber dónde va la siguiente
- `reorder(projectId, orderedIds)` — **en una sola transacción**: `BEGIN`, un
  `UPDATE` de `position` por cada id según su índice en el array (empezando en
  1), `COMMIT`. La restricción diferible hace que esto funcione sin trucos
- `compactPositions(projectId)` — tras borrar, renumera de 1 a N sin huecos

### `sections.service.js`

Todas las reglas:

- crear: el proyecto tiene que existir, si no `NotFoundError`. La posición nueva
  es `getMaxPosition + 1`
- actualizar y borrar: la sección tiene que existir
- borrar: después de borrar, compactar posiciones
- reordenar: los ids recibidos tienen que ser **exactamente** los de ese
  proyecto, ni más ni menos. Si no coinciden, `ValidationError`. Sin esa
  validación se pueden colar ids de otro proyecto y corromper el orden

### API

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/admin/projects/:projectId/sections` | lista ordenada |
| `POST` | `/admin/projects/:projectId/sections` | agrega al final, `201` |
| `PUT` | `/admin/sections/:id` | actualiza `content` |
| `DELETE` | `/admin/sections/:id` | borra y compacta, `204` |
| `PUT` | `/admin/projects/:projectId/sections/reorder` | body `{ "ids": [...] }` |

Todas bajo `authMiddleware`. Se montan como dos routers en `app.js`, uno bajo
`/admin/projects` y otro bajo `/admin/sections`.

### Público

`getPublicProjectBySlug` ahora devuelve el proyecto **con sus secciones**
ordenadas, en la propiedad `sections`. Una sola petición, no dos.

`GET /projects` (el feed) **no** incluye secciones.

---

## Frontend

### Admin — página dedicada

Ruta nueva `/admin/projects/:id/imagenes`, bajo `ProtectedRoute`.

Va en página aparte y no dentro del formulario a propósito: el formulario
guarda al presionar un botón, y la galería guarda en cada acción. Mezclar dos
modelos de guardado en una pantalla confunde.

Contenido:

- título del proyecto y enlace de regreso a su edición
- botón para agregar imagen, que reutiliza el flujo de `ImageUpload`
- lista de imágenes, en orden, cada una con:
  - miniatura
  - campo de texto alternativo, obligatorio, que guarda al perder el foco
  - campo de pie de foto, opcional
  - botones **Subir** y **Bajar**, deshabilitados en los extremos
  - botón de borrar, con confirmación
- estado vacío que explique qué poner ahí

**El orden se hace con botones de subir y bajar, no arrastrando.** Arrastrar
necesita una dependencia nueva y con tres a cinco imágenes por proyecto no
aporta nada.

Al subir una imagen se crea la sección de inmediato con `alt` provisional
—el nombre del archivo sin extensión— y la lista queda enfocada en el campo
de texto alternativo para que se corrija. Nunca se guarda una imagen sin `alt`.

En `ProjectsPage`, cada fila lleva un enlace **Imágenes** hacia esa página.

### Servicios y tipos

- `types/section.ts` — `Section`, `ImageContent`
- `services/sections.service.ts` — una función por endpoint, `BASE_PATH` arriba

### Público — `ProjectPage.tsx`

Debajo de la descripción, donde quedó el comentario marcando el lugar:

- las imágenes se apilan a lo ancho de la columna de lectura, con aire generoso
  entre una y otra
- cada contenedor reserva su espacio con la proporción que sale de `width` y
  `height`; si no vienen, un `aspect-ratio` por defecto
- `alt` siempre presente en el `img`
- el pie de foto, si existe, va debajo en `font-sans` chico y `text-ink-muted`
- `loading="lazy"` en todas menos la primera

El trabajo de Samira es colorido y a sangre. Que respire: la imagen manda, la
interfaz se quita.

---

## Criterios de aceptación

- [ ] `npm run db:migrate` aplica `009` sin errores
- [ ] Subir tres imágenes a un proyecto las deja en orden 1, 2, 3
- [ ] **Reordenar funciona sin errores de llave duplicada** — es el punto que
      esta migración existe para resolver
- [ ] Borrar la de en medio deja las otras en 1 y 2, sin huecos
- [ ] Crear una sección sin `alt` responde `400`
- [ ] Crear una sección con `type` distinto de `image` responde `400`
- [ ] Reordenar mandando un id de otro proyecto responde `400`
- [ ] Sin token, todos los endpoints responden `401`
- [ ] `GET /projects/:slug` devuelve las secciones ordenadas
- [ ] `GET /projects` **no** trae secciones
- [ ] En la página pública las imágenes salen en orden, con su `alt`
- [ ] Al cargar la página el layout **no salta**: el espacio ya estaba reservado
- [ ] Borrar un proyecto borra sus secciones (ya lo hace el `ON DELETE CASCADE`)
- [ ] Cero colores literales de Tailwind
- [ ] Lint de backend y frontend, y build de frontend, limpios

---

## Lo que queda anotado para después

- Tipos de bloque `text`, `quote`, `gallery` y `beforeAfter`: el mapa de schemas
  ya está listo para recibirlos
- `category` (Editorial, Marca, Ilustración), `tools`, `accent_color` y
  `tagline`: van juntos en la spec 06
- Borrar una sección no borra el archivo en R2
