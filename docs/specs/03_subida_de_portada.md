# Spec 03 — Subida de portada (primer corte de media)

Estado: listo para ejecutar
Alcance: módulo `media` en backend + componente de subida en el formulario de proyecto
Fuera de alcance: secciones, galerías, derivados optimizados, borrado en R2

---

## Objetivo

Hoy `cover_image_url` es un campo de texto donde la diseñadora tiene que
**pegar una URL a mano**. Es el último punto del admin donde todavía necesita
algo externo para trabajar.

Al terminar esta tarea: elige un archivo de su computadora, lo ve subir, y la
portada queda puesta.

Es también el cimiento de todo lo que sigue — las secciones de imagen usan el
mismo módulo.

---

## Infraestructura ya lista

El bucket de R2 existe, se llama `mitzuri`, y sirve por `https://cdn.mitzuri.com`.

**Variable nueva en `.env` y en `.env.example`:**

```
R2_PUBLIC_BASE_URL=https://cdn.mitzuri.com
```

Las demás (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ACCESS_KEY_ID`,
`CLOUDFLARE_SECRET_ACCESS_KEY`, `R2_BUCKET`) ya están declaradas.

> `.env.example` lleva la variable **sin valor**. Los valores reales solo van
> en `.env`, que no se versiona. `docs/` sí se versiona, así que en esta spec
> tampoco aparece ningún identificador de cuenta ni credencial.

---

## Dependencias nuevas — requieren aprobación de Ariel

```bash
npm install --prefix backend multer@^2 image-size
```

- **`multer@^2`** — parsea `multipart/form-data`. La versión 2 es obligatoria;
  la 1.x tiene vulnerabilidades conocidas. Se usa con `memoryStorage`: el
  archivo nunca toca el disco, va del buffer directo a R2.
- **`image-size`** — lee ancho y alto del buffer. Es JavaScript puro, sin
  binarios nativos, así que no complica el deploy. Se incluye porque el feed
  público va a necesitar la proporción de cada portada para reservar el espacio
  antes de que la imagen cargue; sin eso el layout salta al cargar.

Ninguna otra dependencia. Si hace falta una tercera, **para y avisa**.

---

## Backend

### Middleware de subida — `shared/middleware/upload.middleware.js`

```js
import multer from "multer";

//el archivo vive en memoria y se manda a R2 sin tocar disco
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
```

### Módulo nuevo — `backend/src/modules/media/`

Respeta la cadena `routes → controller → service → repository`, igual que
`projects`.

**`media.repository.js`**

- `createMediaAsset(data)` — `INSERT` en `media_assets` con `original_url`,
  `alt_text`, `mime_type`, `width`, `height`, `file_size_bytes`. Devuelve la
  fila.

**`media.service.js`** — aquí van todas las reglas:

- valida que `req.file` exista; si no, `ValidationError("File is required")`
- valida el mime contra la lista permitida:
  `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
  Si no está, `ValidationError` con mensaje claro
- genera la key: `media/{uuid}.{ext}`, donde la extensión sale del mime, **no**
  del nombre del archivo que manda el cliente
- sube a R2 con `PutObjectCommand` usando el cliente de `shared/storage/r2Client.js`,
  con `ContentType` correcto y `CacheControl: "public, max-age=31536000, immutable"`
  (la key es única, así que el archivo nunca cambia)
- lee ancho y alto con `image-size`; si falla, guarda `null` en ambos y sigue —
  no es motivo para rechazar la subida
- arma la URL pública: `${R2_PUBLIC_BASE_URL}/${key}`
- delega el `INSERT` al repository

**`media.controller.js`** — lee `req.file` y `req.body.alt_text`, responde
`201` con el asset. `next(error)` en el catch. Cero lógica.

**`media.routes.js`**

```js
router.post("/", upload.single("file"), mediaController.create);
```

No lleva `validate(schema)`: el cuerpo es multipart, no JSON, así que la
validación vive en el service.

### `app.js`

```js
app.use("/admin/media", authMiddleware, mediaRoutes);
```

### Errores de multer

Un archivo que excede el límite hace que multer lance `MulterError` con code
`LIMIT_FILE_SIZE`. Sin manejarlo, `errorMiddleware` lo devuelve como `500`.
Tradúcelo a `ValidationError` con un mensaje entendible, dentro de
`error.middleware.js`.

---

## Contrato de API

| Método | Ruta | Auth | Cuerpo |
| --- | --- | --- | --- |
| `POST` | `/admin/media` | sí | `multipart/form-data` |

Campos: `file` (obligatorio), `alt_text` (opcional).

Respuesta `201`:

```json
{
  "id": "uuid",
  "original_url": "https://cdn.mitzuri.com/media/uuid.webp",
  "optimized_url": null,
  "alt_text": "Portada del proyecto",
  "mime_type": "image/webp",
  "width": 2000,
  "height": 1333,
  "file_size_bytes": 384210,
  "created_at": "..."
}
```

`400` si no hay archivo, si el mime no está permitido, o si excede 10 MB.

---

## Frontend

### `services/apiClient.ts` — cambio necesario

`request()` fuerza `"Content-Type": "application/json"` en cada llamada. Con
`FormData` eso rompe la subida: el navegador tiene que poner el header él mismo
porque incluye el `boundary`.

Cambia `request()` para que, cuando el body sea `FormData`, **no** ponga
`Content-Type` y **no** haga `JSON.stringify`. Agrega el helper:

```ts
upload: <T = unknown>(path: string, formData: FormData) =>
  request<T>(path, { method: "POST", body: formData }),
```

El resto de `apiClient` no cambia. Esto es lo que evita tener que hacer un
`fetch` suelto en un componente, que está prohibido.

### `types/media.ts`

Tipo `MediaAsset` con la forma de la respuesta de arriba.

### `services/media.service.ts`

```ts
const BASE_PATH = "/admin/media";

export const uploadMedia = (file: File, altText?: string): Promise<MediaAsset> => { ... }
```

Arma el `FormData` y llama a `apiClient.upload`.

### `components/ui/ImageUpload.tsx`

Componente nuevo, con `export default` y props tipadas con `type`.

Props: `value: string | null`, `onChange: (url: string | null) => void`,
`label?: string`.

Comportamiento:

- si no hay `value`: zona para elegir archivo, con el texto de los formatos y
  el peso máximo permitidos
- durante la subida: estado de carga y el control deshabilitado
- si hay `value`: muestra la miniatura y un botón para quitarla, que llama
  `onChange(null)`
- si la subida falla: muestra el mensaje del `ApiError` y deja reintentar

Solo tokens del tema. Nada de colores literales.

### `ProjectFormPage.tsx`

Sustituye el input de texto de `cover_image_url` por `<ImageUpload />`.
El formulario sigue mandando `cover_image_url` como string al backend — el
contrato de `projects` **no cambia**. Quitar la portada sigue mandando `""`.

---

## Deuda que se acepta a propósito

Documéntala, no la resuelvas:

- Subir una imagen y no guardar el proyecto deja el archivo huérfano en R2
- Reemplazar una portada no borra la anterior
- Borrar un proyecto no borra su portada
- No se generan derivados optimizados; `optimized_url` queda en `null`
- El asset no queda asociado al proyecto en la base: `projects.cover_image_url`
  sigue siendo una URL suelta. Cuando existan las secciones se decide si la
  portada pasa a ser una llave foránea a `media_assets`

Con ~10 proyectos, limpiar huérfanos a mano cuesta menos que construir la
limpieza automática.

---

## Criterios de aceptación

- [ ] `npm install` solo de los dos paquetes aprobados
- [ ] `R2_PUBLIC_BASE_URL` en `.env.example`, sin valor
- [ ] Subir un JPG, un PNG y un WebP devuelve `201` y la URL abre en el
      navegador y muestra la imagen
- [ ] `width` y `height` llegan con valores reales, no `null`
- [ ] Subir un PDF o un archivo de texto devuelve `400`, no `500`
- [ ] Subir un archivo de más de 10 MB devuelve `400` con mensaje legible
- [ ] Sin token, `POST /admin/media` devuelve `401`
- [ ] Dos archivos con el mismo nombre no se pisan entre sí
- [ ] En la UI: elegir imagen, ver el estado de carga, ver la miniatura,
      guardar, recargar, y la portada sigue ahí
- [ ] Quitar la portada y guardar la deja vacía
- [ ] El resto de las llamadas del admin siguen funcionando — el cambio en
      `apiClient` no rompió login, listado ni guardado
- [ ] `npm run lint --prefix backend` limpio
- [ ] `npm run lint --prefix frontend` y `npm run build --prefix frontend` limpios
