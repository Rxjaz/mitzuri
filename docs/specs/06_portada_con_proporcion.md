# Spec 06 — La portada deja de ser una URL, y el feed se adapta a cada imagen

Estado: listo para ejecutar
Alcance: migración, modelo de portada, endpoint de media, feed en mosaico
Fuera de alcance: categorías, herramientas, `accent_color`, `tagline`

---

## El problema

`Cover` mete todas las portadas en un marco de proporción fija y les aplica
`object-cover`, que recorta. Un tren panorámico y una doble página vertical
acaban forzados en la misma caja.

No se arregla con CSS. La causa es que **el sitio no sabe qué forma tiene la
imagen**: `cover_image_url` es una URL suelta, sin ancho ni alto.

La portada tiene que ser una referencia al asset, no una cadena de texto. Con
eso el proyecto recupera ancho, alto y texto alternativo de una sola vez.

---

## Migración — `backend/sql/010_project_cover_media.sql`

```sql
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS cover_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;

-- las portadas que se subieron por el admin ya tienen su fila en media_assets;
-- se emparejan por URL. Las que se pegaron a mano no tienen respaldo y quedan
-- en NULL: hay que volver a subirlas
UPDATE projects p
SET cover_media_id = m.id
FROM media_assets m
WHERE m.original_url = p.cover_image_url;

ALTER TABLE projects DROP COLUMN cover_image_url;

CREATE INDEX IF NOT EXISTS idx_projects_cover_media_id ON projects(cover_media_id);
```

`ON DELETE SET NULL`: si algún día se borra un asset, el proyecto se queda sin
portada, no roto.

---

## Backend

### Forma de la portada en las respuestas

`cover_image_url` desaparece del contrato. En su lugar:

```json
"cover": {
  "id": "uuid",
  "url": "https://cdn.mitzuri.com/media/uuid.jpg",
  "alt": "Vagon del tren intervenido con la grafica de MusMania",
  "width": 2400,
  "height": 1350
}
```

`null` si el proyecto no tiene portada.

Aplica a las tres puertas: listado admin, detalle admin, y los dos endpoints
públicos. Se arma con un `LEFT JOIN` a `media_assets`, nunca con una segunda
consulta por proyecto.

### `projects.repository.js`

- Todas las consultas que devuelven proyectos hacen `LEFT JOIN media_assets`
  y construyen el objeto `cover`. Sigue valiendo la regla de columnas
  explícitas en los endpoints públicos
- `createProject` y `updateProject` persisten `cover_media_id`

### `projects.schemas.js`

`cover_image_url` sale. Entra:

```js
cover_media_id: z.uuid().nullable().optional(),
```

`null` quita la portada. Ya no existe el `""` como forma de limpiar.

### Media: poder corregir el texto alternativo

Endpoint nuevo, para editar el `alt` de un asset ya subido:

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| `PUT` | `/admin/media/:id` | `{ "alt_text": "..." }` |

Valida con `validate(schema)`: `alt_text` string, mínimo 1 carácter. `404` si el
asset no existe. Devuelve el asset actualizado.

---

## Frontend

### `Cover.tsx` — reescribir

Deja de recibir `src` y `ratio`. Ahora recibe el objeto `cover` completo y
**nunca recorta**:

- el contenedor reserva el espacio con `aspect-ratio` calculado de `width` y
  `height` reales
- la imagen llena ese espacio con `object-cover`, que ya no recorta nada porque
  el marco tiene exactamente su proporción
- si no hay `width`/`height`, usa `4 / 3` como respaldo
- si no hay portada, el estado vacío actual
- el `alt` sale de `cover.alt`; borra el comentario que decía que era
  inalcanzable, porque ya no lo es

### Feed — mosaico en dos columnas, con el orden correcto

El destacado —el primero del orden— sigue solo, a todo el ancho, con su
proporción real.

El resto va en mosaico. **El reparto en columnas se hace en React, alternando**,
no con `columns` de CSS:

```
proyecto 1 → columna izquierda
proyecto 2 → columna derecha
proyecto 3 → columna izquierda
proyecto 4 → columna derecha
```

Así, leyendo de izquierda a derecha, el orden curado se percibe correcto. Con
`columns` de CSS las fichas fluyen hacia abajo por columna y el orden se rompe.

- dos columnas en escritorio, **una sola en móvil** — ahí el orden es exacto
- cada ficha conserva su proporción; las columnas pueden terminar a alturas
  distintas y está bien
- el número de columnas vive en un solo sitio, para poder subirlo a tres cuando
  haya más proyectos

### Página de proyecto

La portada se muestra a su proporción real, sin recorte. Tope de `85vh` de alto
para que una pieza muy vertical no se coma tres pantallas: en ese caso la imagen
se centra y respeta su proporción.

### Formulario de proyecto

- `ImageUpload` ya devuelve el `MediaAsset`; el formulario guarda
  `cover_media_id`, no la URL
- campo de **texto alternativo de la portada**, obligatorio cuando hay portada,
  que guarda contra `PUT /admin/media/:id`
- quitar la portada manda `cover_media_id: null`

### Tipos

`Project`, `ProjectInput` y `PublicProject` pierden `cover_image_url` y ganan
`cover: CoverAsset | null`. `ProjectInput` gana `cover_media_id`.

---

## Corrección aparte, chica

En `ProjectImagesPage`, si el texto alternativo se deja vacío y se sale del
campo, aparece el aviso de que es obligatorio pero **el campo se queda vacío en
pantalla** mientras la base conserva el valor anterior. Parece que se guardó
vacío.

Al rechazar el cambio, devuelve al campo su valor anterior.

---

## Criterios de aceptación

- [ ] `npm run db:migrate` aplica `010`; las portadas subidas por el admin
      conservan su imagen
- [ ] `grep -rn "cover_image_url" backend/src frontend/src` no devuelve nada
- [ ] Una portada horizontal se ve completa, sin recorte
- [ ] Una portada vertical se ve completa, sin recorte
- [ ] Subir una portada vertical y una horizontal al mismo feed: **las dos se
      ven enteras y el feed no se descuadra**
- [ ] En escritorio el feed tiene dos columnas y el orden se lee de izquierda a
      derecha según `sort_order`
- [ ] En móvil hay una sola columna y el orden es exacto
- [ ] El layout **no salta** al cargar: el espacio ya estaba reservado
- [ ] El texto alternativo de la portada se edita desde el formulario y persiste
- [ ] Quitar la portada la deja vacía y el proyecto no se rompe
- [ ] Un proyecto sin portada se ve bien en feed y en su página
- [ ] En la galería, dejar vacío el texto alternativo restaura el valor anterior
- [ ] Cero colores literales de Tailwind
- [ ] Lint de backend y frontend, y build de frontend, limpios

---

## Lo que queda para la spec 07

Categorías (Editorial, Marca, Ilustración), herramientas, `accent_color` y
`tagline`. `accent_color` gana sentido justo ahora: cada proyecto ya tiene
imágenes reales de las que sacar su color dominante.
