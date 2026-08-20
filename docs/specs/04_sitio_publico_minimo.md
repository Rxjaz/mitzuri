# Spec 04 — Sitio público mínimo

Estado: listo para ejecutar
Alcance: endpoints públicos, feed, página de proyecto por slug, una migración
Fuera de alcance: secciones, preview por token, `accent_color`, `tagline`

---

## Objetivo

Hoy `published` y `unlisted` no producen ningún efecto observable. Se puede
publicar un proyecto y no pasa nada, porque no existe sitio público.

Al terminar esta tarea:

- un proyecto `published` aparece en el feed y tiene página propia
- un proyecto `unlisted` **no** aparece en el feed pero su URL funciona — que
  era la razón de existir de ese estado
- un proyecto `draft` no es accesible de ninguna forma

Es también la primera vez que la identidad visual se ve aplicada de verdad.

---

## Migración — `backend/sql/008_project_sort_order.sql`

El orden de un portafolio es una decisión editorial, no cronológica. Con cinco
proyectos públicos, cuál va primero importa más que cuándo se hizo.

```sql
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
```

Orden del feed, en este orden exacto:

```sql
ORDER BY sort_order ASC, published_at DESC NULLS LAST, created_at DESC
```

Número más chico aparece primero. Empatados, gana el más recién publicado.

---

## Backend

Los endpoints públicos viven **en el módulo `projects`**, no en uno nuevo: son
el mismo recurso, distinto público.

### `projects.repository.js`

Dos funciones nuevas. Las dos seleccionan **columnas explícitas**, nunca
`SELECT *` — este repo es público y un endpoint sin auth no debe devolver
columnas internas como `slug_locked` o `status`.

Columnas públicas: `id`, `title`, `slug`, `description`, `cover_image_url`,
`year`, `client`, `published_at`.

- `getPublishedProjects()` — solo `status = 'published'`, con el `ORDER BY` de
  arriba.
- `getPublicProjectBySlug(slug)` — busca por slug donde
  `status IN ('published', 'unlisted')`. **Un `draft` nunca se devuelve.**
  Además necesita traer `status`, porque el frontend lo usa para decidir si la
  página lleva `noindex`.

### `projects.service.js`

- `getPublishedProjects()` — delega, sin reglas.
- `getPublicProjectBySlug(slug)` — si no existe, `NotFoundError`. Es importante
  que un `draft` y un slug inexistente den **exactamente el mismo 404**: si se
  distinguen, cualquiera puede adivinar qué borradores existen.

### `projects.controller.js`

`getPublicAll` y `getPublicBySlug`, con la misma forma que el resto.

### `projects.public.routes.js`

Archivo nuevo en el mismo módulo, sin `authMiddleware`:

```js
router.get("/", projectsController.getPublicAll);
router.get("/:slug", projectsController.getPublicBySlug);
```

### `app.js`

```js
app.use("/projects", projectsPublicRoutes);
```

Va **antes** del `404` inline y sin middleware de auth.

### `projects.schemas.js`

`sort_order` entra como campo opcional en create y update:
`z.coerce.number().int().optional()`. El repositorio ya debe persistirlo en
`createProject` y `updateProject`.

---

## Contrato de API

| Método | Ruta | Auth | Devuelve |
| --- | --- | --- | --- |
| `GET` | `/projects` | no | array de publicados, ordenados |
| `GET` | `/projects/:slug` | no | proyecto `published` o `unlisted` |

`404` si el slug no existe o el proyecto está en `draft`.

---

## Frontend

### Rutas

- `/` — feed
- `/proyectos/:slug` — página de proyecto

La ruta tiene que ser exactamente `/proyectos/:slug`, porque es la URL que ya
le muestra `ProjectFormPage` a la diseñadora.

### `services/projects.public.service.ts`

`getPublicProjects()` y `getPublicProject(slug)`, con `BASE_PATH = "/projects"`.
Servicio aparte del de admin: distinto público, distinto contrato.

### Feed — `app/public/pages/HomePage.tsx`

Variante **editorial**, con cinco proyectos en mente:

- el primero del orden es el destacado: portada ancha, título grande
- el resto en una cuadrícula de dos columnas, que colapsa a una en móvil
- cada ficha: portada, título, y `client · year` debajo
- toda la ficha es un enlace a `/proyectos/{slug}`

Estados: cargando, error, y vacío. El vacío importa — es lo que se ve el primer
día, antes de publicar nada.

### Página de proyecto — `app/public/pages/ProjectPage.tsx`

Estructura, de arriba a abajo:

1. título en `font-display`
2. línea de metadatos: `client · year`
3. portada a ancho amplio
4. descripción, ancho de lectura cómodo (máximo ~65 caracteres por línea)
5. enlace de regreso al feed

Debajo de la descripción, deja un comentario marcando dónde se van a montar las
secciones. Esta página se va a volver a abrir cuando existan.

### Tipografía — las reglas no negociables

- `font-display` (Yeseva One) **solo** en el título del proyecto y en el título
  del destacado del feed, y **solo a 24px o más**
- todo lo demás en `font-sans`
- Yeseva no tiene bold ni itálica: la jerarquía se hace con tamaño y espaciado
- ningún color literal de Tailwind, solo tokens

### Imágenes

No tenemos las proporciones de la portada — `cover_image_url` es una URL suelta,
sin relación con `media_assets`. Así que reserva el espacio con `aspect-ratio`
en el contenedor y `object-cover` en la imagen. Sin eso, el layout salta cuando
carga.

Un proyecto sin portada debe verse bien igual, no roto.

### SEO — y una regla crítica

React 19 sube al `<head>` las etiquetas `<title>` y `<meta>` que devuelvas
desde un componente. No hace falta ninguna librería.

- feed: `<title>Mitzuri</title>` y una meta description
- proyecto: `<title>{title} · Mitzuri</title>` y la descripción del proyecto

**Y lo más importante de toda esta spec:**

```tsx
{project.status === "unlisted" && (
  <meta name="robots" content="noindex, nofollow" />
)}
```

Sin eso, Google indexa las páginas no listadas y dejan de ser privadas. Un
proyecto que la diseñadora compartió solo con un cliente terminaría en
resultados de búsqueda. Eso destruye por completo la razón de ser de `unlisted`.

### `PublicLayout.tsx`

Encabezado con el nombre **Mitzuri** enlazando al feed, y pie de página sobrio.
Sin logo todavía.

### Admin

- `ProjectFormPage`: campo numérico `Orden`, con la ayuda "número más chico
  aparece primero"
- `ProjectsPage`: mostrar el orden en la tabla
- `ProjectFormPage`: cuando el proyecto no está en `draft`, un enlace que abra
  su URL pública en pestaña nueva

### Limpieza

Borra `app/public/pages/FeedLabPage.tsx` y su ruta `/lab`. Era la maqueta
temporal para elegir dirección de feed; la dirección ya está elegida y ahora
existe el feed real.

---

## Criterios de aceptación

- [ ] `npm run db:migrate` aplica `008` sin errores
- [ ] `GET /projects` devuelve solo los `published`, en el orden definido
- [ ] `GET /projects` **no** devuelve `status` ni `slug_locked`
- [ ] `GET /projects/:slug` de un `unlisted` responde `200`
- [ ] `GET /projects/:slug` de un `draft` responde `404`
- [ ] Un slug inexistente y un `draft` devuelven la **misma** respuesta
- [ ] Ninguno de los dos endpoints públicos pide token
- [ ] Cambiar `sort_order` reordena el feed
- [ ] La página de un `unlisted` incluye `noindex` en el HTML; la de un
      `published` **no**
- [ ] El feed vacío muestra un mensaje decente, no una pantalla en blanco
- [ ] Un proyecto sin portada no rompe el diseño
- [ ] El título del proyecto usa Yeseva One; ningún texto menor a 24px la usa
- [ ] `/lab` ya no existe
- [ ] `grep -rE "stone-|slate-|gray-|zinc-" frontend/src` no devuelve nada
- [ ] En móvil el feed se lee bien y la cuadrícula colapsa a una columna
- [ ] `npm run lint` de backend y frontend, limpios
- [ ] `npm run build --prefix frontend` limpio

---

## Lo que queda anotado para después

- `accent_color` y `tagline`: se deciden cuando veas el feed con contenido real
- La portada sigue siendo una URL suelta, así que su texto alternativo vive en
  `media_assets` y es inalcanzable desde el proyecto. Se resuelve al decidir si
  la portada pasa a ser llave foránea
- Preview por token para borradores, que es lo único que `unlisted` no cubre
