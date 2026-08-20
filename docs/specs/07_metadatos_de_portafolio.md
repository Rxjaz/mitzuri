# Spec 07 — Metadatos del portafolio

Estado: listo para ejecutar
Alcance: cuatro columnas nuevas en `projects`, formulario y presentación pública
Fuera de alcance: deploy, preview por token, tipos de bloque nuevos

---

## Objetivo

Se hace **antes** de que Samira cargue su trabajo real. Si estas columnas
llegan después, tiene que volver a entrar a doce proyectos para llenarlas.

Los cuatro campos salen de su portafolio real, no de una idea nuestra:

| Campo | De dónde sale |
| --- | --- |
| `category` | Ella misma separa su trabajo en Editorial, Marca e Ilustración |
| `tools` | Cada proyecto suyo lista las herramientas que usó |
| `accent_color` | Cada pieza ya tiene un color dominante propio |
| `credits` | Cuatro de sus proyectos son colaborativos y ella especifica su parte |

---

## Migración — `backend/sql/011_project_metadata.sql`

```sql
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS tools TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS accent_color TEXT,
    ADD COLUMN IF NOT EXISTS credits TEXT;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;
ALTER TABLE projects ADD CONSTRAINT projects_category_check
    CHECK (category IS NULL OR category IN ('editorial', 'marca', 'ilustracion'));

-- solo hex de seis digitos: cualquier otra cosa entraria como variable CSS
-- directo al atributo `style` de la pagina publica
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_accent_color_check;
ALTER TABLE projects ADD CONSTRAINT projects_accent_color_check
    CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$');

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
```

`category` admite `NULL` para que los proyectos existentes sobrevivan, pero el
formulario la exige en cualquier proyecto nuevo.

La categoría se guarda **sin acentos y en minúsculas** (`ilustracion`). La
etiqueta bonita —"Ilustración"— se arma en el frontend. Nunca se guarda texto
de presentación en la base.

---

## Backend

### `projects.schemas.js`

```js
category: z.enum(["editorial", "marca", "ilustracion"]).nullable().optional(),
tools: z.array(z.string().min(1)).max(12).optional(),
accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un hex de seis digitos").nullable().optional(),
credits: z.string().max(500).nullable().optional(),
```

### `projects.repository.js`

Los cuatro campos se persisten en `createProject` y `updateProject`, y viajan en
las columnas públicas de los dos endpoints sin auth.

Postgres devuelve `TEXT[]` como array de JavaScript, sin conversión manual.

---

## Frontend — admin

En `ProjectFormPage`, un bloque nuevo llamado **Ficha del proyecto**:

- **Categoría** — select con las tres opciones, obligatorio
- **Herramientas** — un campo de texto separado por comas, que se parte al
  guardar y se vuelve a unir al cargar. Texto de ayuda con las más frecuentes:
  Photoshop, Illustrator, InDesign
- **Color de acento** — un `<input type="color">` junto a un campo de texto con
  el hex, sincronizados. Botón para quitarlo y volver al azul del sitio
- **Créditos** — área de texto, opcional. Etiqueta: "Si fue un proyecto
  colaborativo, describe tu parte". Ayuda: "Se muestra tal cual en la página
  pública"

### Aviso de contraste — obligatorio

El color de acento se usa en texto sobre fondo blanco. Un amarillo claro sería
ilegible.

Calcula la relación de contraste del color elegido contra `#FFFFFF` con la
fórmula estándar de luminancia relativa. Si baja de **4.5:1**, muestra un aviso
junto al campo: que el color es difícil de leer sobre blanco y conviene uno más
oscuro.

**Avisa, no bloquea.** Ella es diseñadora; la decisión es suya, pero merece el
dato. Pon el cálculo en `lib/contrast.ts`, que es una función pura y se puede
reutilizar.

---

## Frontend — público

### Feed

Cada ficha muestra su categoría como etiqueta discreta encima del título, en
`font-sans` chico, mayúsculas y `text-ink-muted`. No es un filtro ni un enlace:
solo contexto.

### Página de proyecto

**El acento sustituye al azul dentro de la página.** Como los tokens de Tailwind
4 son variables CSS, basta con redefinir la variable en el elemento raíz de la
página:

```tsx
<article
  className="project-page"
  style={project.accent_color
    ? ({ "--color-brand": project.accent_color } as CSSProperties)
    : undefined}
>
```

Todo lo que dentro use `brand` cambia solo. Sin `accent_color`, se queda el azul
del sitio. No dupliques clases ni escribas colores en línea en cada elemento.

Debajo de la línea de metadatos existente:

- **categoría**, con su etiqueta legible
- **herramientas**, si hay: separadas por `·`, en `font-sans` chico
- **créditos**, si hay: en su propio párrafo, precedido de "Proyecto
  colaborativo", con `text-ink-muted`

Nada de esto debe empujar a la portada muy abajo. Son datos de apoyo, no el
contenido.

### Etiquetas legibles

Un solo mapa, en `types/project.ts` o junto a él:

```ts
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  editorial: "Editorial",
  marca: "Marca",
  ilustracion: "Ilustración",
};
```

Se usa en admin y en público. **Nunca escribas esas etiquetas a mano dos veces.**

---

## Criterios de aceptación

- [ ] `npm run db:migrate` aplica `011` y los proyectos existentes sobreviven
- [ ] Guardar una categoría inválida responde `400`
- [ ] Guardar `accent_color` sin `#` o con formato raro responde `400`
- [ ] La base rechaza un `accent_color` mal formado aunque se inserte a mano
- [ ] Escribir "Photoshop, Illustrator" en herramientas guarda dos elementos, y
      al recargar el formulario aparecen igual
- [ ] Un proyecto **con** acento tiñe su página; uno **sin** acento se ve azul
- [ ] Elegir un color claro muestra el aviso de contraste, y **deja guardar**
- [ ] La categoría aparece en el feed y en la página
- [ ] Los créditos solo aparecen cuando existen
- [ ] Un proyecto sin ninguno de los cuatro campos se sigue viendo bien
- [ ] Cero colores literales de Tailwind
- [ ] Lint de backend y frontend, y build de frontend, limpios

---

## Decidido a propósito: `tagline` no entra

Era la cuarta palanca de identidad del documento
[05_IDENTIDAD_Y_FEED.md](../producto/05_IDENTIDAD_Y_FEED.md), pero cada campo
opcional es una decisión más que Samira tiene que tomar doce veces mientras
carga su trabajo.

El feed hoy se lee bien con título, cliente y año. Si con contenido real se
siente escueto, agregar la columna cuesta veinte minutos — y entonces la
decisión se toma mirando el feed lleno, no imaginándolo.
