# Spec 01 — Estado `unlisted` y bloqueo permanente del slug

Estado: listo para ejecutar
Alcance: backend + una migración + un ajuste chico de UI admin
Fuera de alcance: sitio público, media, secciones

---

## Objetivo

Un proyecto terminado debe poder tener URL permanente y compartible **sin
aparecer en el listado público**. Hoy solo existen `draft` y `published`, así
que la única forma de compartir algo terminado es publicarlo para todo el
mundo.

Se agrega un tercer estado: `unlisted`.

---

## Bug que se corrige de paso

Hoy el slug **no** queda congelado como dice la documentación.

`updateProject` reconstruye el slug cuando `existing.status === "draft"`. Pero
`unpublishProject` regresa el proyecto a `draft`. Entonces esta secuencia rompe
una URL ya compartida:

```
publicar  →  status = published, slug = "identidad-cafe-luna"
despublicar → status = draft
cambiar el título → slug = "identidad-cafe-lu"   ← la URL vieja da 404
```

La regla correcta no es "congelar al publicar", es **congelar la primera vez
que el proyecto deja de ser borrador, para siempre**. Una vez que una URL pudo
salir al mundo, ya no se puede reciclar.

---

## Modelo de estados

```
                ┌──────────────┐
      publish   │              │   unlist
   ┌───────────▶│  published   │◀──────────┐
   │            │              │           │
   │            └──────┬───────┘           │
   │                   │ unlist            │
   │                   ▼                   │
┌──┴────┐  unlist  ┌──────────┐  publish ──┘
│ draft │─────────▶│ unlisted │
└───────┘          └──────────┘
   ▲                   │
   └───────────────────┘
        unpublish
```

- `draft` — solo visible en el admin
- `unlisted` — accesible por URL, **no** aparece en listados públicos
- `published` — accesible por URL y visible en el feed público

Reglas:

1. Salir de `draft` hacia `published` o `unlisted` **bloquea el slug de forma
   permanente**. Regresar a `draft` no lo desbloquea.
2. `published_at` marca la última vez que el proyecto salió de borrador. Se
   conserva al pasar de `published` a `unlisted` y viceversa. Se limpia solo al
   regresar a `draft`.
3. Todas las transiciones son válidas. No hay estados terminales.

---

## Migración — `backend/sql/007_project_unlisted.sql`

Archivo nuevo. No modificar ninguna migración existente.

```sql
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS slug_locked BOOLEAN NOT NULL DEFAULT false;

-- los proyectos que ya salieron de borrador tienen su URL potencialmente
-- compartida, asi que nacen bloqueados
UPDATE projects SET slug_locked = true WHERE status <> 'draft';

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
    CHECK (status IN ('draft', 'unlisted', 'published'));

-- un borrador nunca tiene fecha de publicacion; unlisted y published si pueden
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_published_at_check;
ALTER TABLE projects ADD CONSTRAINT projects_published_at_check
    CHECK (published_at IS NULL OR status <> 'draft');
```

---

## Backend

### `projects.repository.js`

- `publishProject` — sin cambios de comportamiento, pero además debe fijar
  `slug_locked = true`.
- `unpublishProject` — sigue regresando a `draft`, `published_at = NULL`.
  **No** toca `slug_locked`.
- Nueva `unlistProject(id)` — `status = 'unlisted'`,
  `published_at = COALESCE(published_at, NOW())`, `slug_locked = true`.
- `updateProject` — el `UPDATE` no debe tocar `status`, `published_at` ni
  `slug_locked`. Esos solo cambian por las acciones de estado.

### `projects.service.js`

Cambiar la condición del slug en `updateProject`:

```js
// antes
titleChanged && existing.status === "draft"

// despues — una URL que ya pudo compartirse no se recicla nunca
titleChanged && !existing.slug_locked
```

Agregar `unlistProject(id)` siguiendo el mismo patrón que `publishProject`:
busca por id, lanza `NotFoundError` si no existe, delega al repository.

### `projects.controller.js`

Agregar `unlist`, idéntico en forma a `publish`.

### `projects.routes.js`

```js
router.post("/:id/unlist", projectsController.unlist);
```

### `projects.schemas.js`

Sin cambios. `status` no se acepta desde el cliente; solo cambia por las tres
acciones dedicadas.

---

## Contrato de API

| Método | Ruta | Efecto | Respuesta |
| --- | --- | --- | --- |
| `POST` | `/admin/projects/:id/publish` | → `published` | `200` proyecto |
| `POST` | `/admin/projects/:id/unlist` | → `unlisted` | `200` proyecto |
| `POST` | `/admin/projects/:id/unpublish` | → `draft` | `200` proyecto |

Las tres devuelven el proyecto completo, incluyendo `slug_locked`.
`404` si el id no existe.

---

## Frontend

### `src/types/project.ts`

```ts
export type ProjectStatus = "draft" | "unlisted" | "published";
```

Agregar `slug_locked: boolean` al tipo `Project`.

### `src/services/projects.service.ts`

Agregar `unlistProject(id)`, misma forma que `publishProject`.

### `src/app/admin/pages/ProjectsPage.tsx`

Las acciones de cada fila dependen del estado actual. Mostrar solo las
transiciones que tienen sentido:

| Estado actual | Acciones visibles |
| --- | --- |
| `draft` | `Publicar` · `Compartir en privado` |
| `unlisted` | `Publicar` · `Volver a borrador` |
| `published` | `Quitar del feed` · `Volver a borrador` |

El indicador de estado debe distinguir los tres visualmente. `unlisted` no es
un error ni una advertencia: es un estado normal. Usa un tono neutro, no
ámbar ni rojo.

---

## Criterios de aceptación

Cada punto tiene que poder comprobarse a mano antes de dar la tarea por hecha.

- [ ] `npm run db:migrate` aplica `007` sin errores y es idempotente al
      correrlo dos veces
- [ ] Un proyecto en `draft` puede pasar a `unlisted` y de ahí a `published`
- [ ] Publicar un proyecto y luego cambiarle el título **no** cambia el slug
- [ ] Despublicar, cambiar el título y volver a publicar **tampoco** cambia el
      slug — este es el bug que se está corrigiendo
- [ ] Pasar de `published` a `unlisted` conserva `published_at`
- [ ] Regresar a `draft` deja `published_at` en `NULL` y `slug_locked` en `true`
- [ ] La base rechaza un `status` que no sea uno de los tres
- [ ] `PUT /admin/projects/:id` no puede cambiar `status` aunque se mande en el
      body
- [ ] Las tres acciones responden `404` con un id inexistente
- [ ] En la UI, cada estado muestra solo sus acciones válidas
- [ ] `npm run lint --prefix backend` limpio
- [ ] `npm run lint --prefix frontend` y `npm run build --prefix frontend` limpios

---

## Lo que NO se hace en esta tarea

- Endpoints públicos. Cuando existan, `unlisted` se sirve por slug pero se
  excluye de cualquier listado. Eso va en su propia spec.
- Tocar `project_preview_tokens`. Queda una pregunta abierta: si `unlisted`
  ya resuelve compartir trabajo terminado, los tokens de preview solo sirven
  para enseñar borradores. Puede que la Fase 6 se reduzca mucho, pero eso se
  decide después.
- Campos de identidad (`accent_color`, `sort_order`, `tagline`). Van con el
  feed público.
- Renombrar `published_at`. Su significado se amplió, pero cambiarle el nombre
  ahorita es churn sin beneficio.
