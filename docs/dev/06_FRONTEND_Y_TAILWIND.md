# Frontend y Tailwind

Revisado el `2026-08-23`. Tailwind 4 ya está adoptado y el sistema visual ya
tiene los valores reales de la diseñadora. Este documento explica cómo está
montado y cómo decidir dónde va cada cosa.

## El sistema de tokens

Todo el color y la tipografía viven en el bloque `@theme` de
[frontend/src/index.css](../../frontend/src/index.css):

```css
@theme {
  --font-display: "Yeseva One", Georgia, serif;
  --font-sans: "Be Vietnam Pro", system-ui, sans-serif;

  --text-display-xl: 4rem;
  --text-display-lg: 2.75rem;
  --text-display-md: 1.75rem;

  --color-ink: #070707;
  --color-ink-muted: #5c5c61;
  --color-paper: #ffffff;
  --color-surface: #f5f5f7;
  --color-border: #e2e2e6;
  --color-brand: #0d30f2;
  --color-brand-strong: #0a26c2;
  --color-brand-soft: #edf0fe;
  --color-danger: #b42318;
}
```

Eso genera las utilidades solo: `bg-brand`, `text-ink-muted`, `border-border`.

**Está prohibido usar colores literales de Tailwind.** Nada de `stone-900`,
`blue-600` ni `gray-100`. Si un color que necesitas no existe como token, se
pregunta; no se inventa.

La razón no es purismo. Antes de tener tokens, cada componente traía el gris que
un agente eligió porque no tenía nada mejor, y esa paleta accidental se iba
heredando pantalla tras pantalla. Con tokens, cambiar un hex cambia el sitio
entero.

### Verificación

```bash
grep -rE "stone-|slate-|gray-|zinc-" frontend/src
```

Vacío o está mal.

## Tipografía

**Yeseva One** solo en el sitio público y solo a 24px o más. Tiene un único peso
—sin bold, sin itálica— así que la jerarquía entre títulos se hace con **tamaño
y espaciado**, nunca con peso.

**Be Vietnam Pro** para todo lo demás, en 400, 500 y 700.

El admin no carga la display: es una herramienta de trabajo, y una serif de
display en tablas y formularios estorba. Por eso Yeseva se importa dentro de
`PublicLayout.tsx` y no en `main.tsx`.

Las dos son self-hosted con `@fontsource`, así que viajan en el build y no
dependen de un tercero.

## El color de acento por proyecto

Cada proyecto puede tener su `accent_color`, y dentro de su página **sustituye
al azul del sitio**. Como los tokens son variables CSS, basta redefinirlas en el
elemento raíz:

```tsx
<article style={{ "--color-brand": project.accent_color }}>
```

Todo lo que use `brand` ahí dentro cambia solo. Sin duplicar clases ni escribir
colores en línea.

La regla que lo ordena: azul, blanco y negro son la identidad **del sitio**; el
acento es la identidad **del proyecto**. Nunca compiten en la misma pantalla.

El formulario avisa si el acento elegido tiene menos de 4.5:1 de contraste sobre
blanco, con el cálculo en `lib/contrast.ts`. **Avisa, no bloquea**: la decisión
es de la diseñadora, pero merece el dato.

## Los tres niveles de estilo

**Utilidades sueltas** cuando el ajuste es pequeño y local: `mt-6`, `w-full`.

**Clases semánticas** en `styles/components.css`, dentro de `@layer components`,
cuando un bloque visual se repite y ya expresa una intención: `.panel-card`,
`.feed-mosaic`, `.badge-published`.

**Componentes React** en `components/ui/` cuando la pieza tiene estructura HTML
repetida y recibe props: `Button`, `Input`, `Select`, `Cover`, `ImageUpload`.

La regla práctica: si se repite solo el estilo, clase semántica. Si se repite
estructura y props, componente. Si es único y corto, utilidad inline.

## Convenciones de los componentes

- `export default`
- props tipadas con `type`, no `interface`
- variantes como `Record<Variant, string>` de clases **completas**
- `cn` de `lib/cn.ts` **solo concatena**; no resuelve conflictos de Tailwind, así
  que cada variante trae su set entero en vez de sobreescribir una base
- para pasar `ref`, usar `ComponentProps<"input">` y no
  `InputHTMLAttributes`: en React 19 la ref es una prop normal

## Estructura vigente

```text
frontend/src/
├── app/
│   ├── admin/     auth, layout, pages, routes.tsx
│   └── public/    layout, pages, routes.tsx
├── components/ui/ todo lo compartido vive aqui
├── lib/           cn.ts, contrast.ts
├── services/      apiClient y uno por feature
├── styles/        components.css
└── types/         auth, project, media, section
```

Se planearon `components/admin/`, `components/blocks/` y `components/shared/`, y
ninguna llegó a usarse: **todo lo compartido acabó en `ui/`**. Si esas carpetas
siguen en tu disco, están vacías.

## Riesgos a evitar

- volver a meter un color literal "solo por esta vez"
- usar la display por debajo de 24px, o intentar ponerle negritas
- esconder toda utilidad dentro de clases semánticas; eso elimina buena parte
  del beneficio de Tailwind
- crear abstracciones de UI antes de tener dos o tres pantallas que las pidan
- meter una librería de componentes ahora que el lenguaje visual ya es propio
