# Spec 02 — Sistema visual: tipografías y tokens de color

Estado: listo para ejecutar (después de cerrar la spec 01)
Alcance: solo frontend. No toca backend, base de datos ni contratos de API.

---

## Objetivo

Hoy los colores del proyecto los eligió un agente, no la diseñadora.
`Button.tsx` dice `bg-stone-900` porque no había nada mejor que usar. Esta spec
mete la identidad real como **tokens**, y deja el código sin margen para
improvisar.

Después de esto, cambiar un hex cambia todo el sitio.

---

## Identidad decidida

| Rol | Valor |
| --- | --- |
| Tipografía display | **Yeseva One** — un solo peso (400) |
| Tipografía de texto | **Be Vietnam Pro** — pesos 400, 500, 700 |
| Negro | `#070707` |
| Blanco | `#FFFFFF` |
| Azul de marca | `#0D30F2` |

Reglas que salen de la identidad y que el código debe respetar siempre:

1. **Yeseva One solo a 24px o más.** Es display, no tiene bold ni itálica. La
   jerarquía entre títulos se hace con **tamaño y espaciado**, nunca con peso.
   Nada por debajo de 24px lleva Yeseva.
2. **El admin no carga Yeseva One.** Es una herramienta de trabajo: todo en
   Be Vietnam Pro. Solo el sitio público usa la display.
3. **Azul sobre negro está prohibido para texto** — da 2.6:1 de contraste. Sobre
   fondo oscuro el texto va blanco; el azul solo como bloque o borde.
4. Azul, blanco y negro son la identidad **del sitio**. El `accent_color` de
   cada proyecto es la identidad **del proyecto**: dentro de su página, el
   acento sustituye al azul. Nunca compiten en la misma pantalla.

---

## Dependencias nuevas — requieren aprobación de Ariel

Aprobadas para esta tarea, ninguna más:

```bash
npm install --prefix frontend @fontsource/yeseva-one @fontsource/be-vietnam-pro
```

Si alguno de los dos paquetes no existe con ese nombre exacto, **para y
avisa**. No lo sustituyas por Google Fonts ni por otro paquete.

---

## Tokens — `frontend/src/index.css`

Tailwind 4 declara tokens con `@theme`. Van después del `@import "tailwindcss"`
y antes del import de `components.css`.

```css
@import "tailwindcss";

@theme {
  /* tipografia */
  --font-display: "Yeseva One", Georgia, serif;
  --font-sans: "Be Vietnam Pro", system-ui, sans-serif;

  /* escala display — solo sitio publico, nunca bajo 24px */
  --text-display-xl: 4rem;
  --text-display-xl--line-height: 1.05;
  --text-display-lg: 2.75rem;
  --text-display-lg--line-height: 1.1;
  --text-display-md: 1.75rem;
  --text-display-md--line-height: 1.2;

  /* color */
  --color-ink: #070707;         /* texto principal */
  --color-ink-muted: #5c5c61;   /* texto secundario — 6.6:1 sobre blanco */
  --color-paper: #ffffff;       /* fondo base */
  --color-surface: #f5f5f7;     /* fondo sutil de bloques */
  --color-border: #e2e2e6;      /* bordes y separadores */
  --color-brand: #0d30f2;       /* azul de marca — 7.7:1 con blanco */
  --color-brand-strong: #0a26c2;/* hover y estados presionados */
  --color-brand-soft: #edf0fe;  /* fondo tenue de marca */
}

@import "./styles/components.css";

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-ink);
  background-color: var(--color-paper);
}
```

Los tokens de color generan utilidades automáticamente: `bg-brand`,
`text-ink-muted`, `border-border`, etc.

---

## Carga de fuentes

**Be Vietnam Pro** es global. En `src/main.tsx`, antes del import de
`index.css`:

```ts
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/700.css";
```

**Yeseva One** solo en el sitio público. En
`src/app/public/layout/PublicLayout.tsx`:

```ts
import "@fontsource/yeseva-one/400.css";
```

Así el admin nunca descarga la display. No la importes en `main.tsx` ni en
`index.css`.

---

## Reemplazo de colores literales

Hay 34 usos de colores literales de Tailwind en 5 archivos. Todos se
reemplazan por tokens:

| Archivo | Usos |
| --- | --- |
| `src/styles/components.css` | 28 |
| `src/components/ui/Button.tsx` | 3 |
| `src/components/ui/Card.tsx` | 1 |
| `src/components/ui/Input.tsx` | 1 |
| `src/components/ui/Textarea.tsx` | 1 |

Equivalencias:

| Antes | Después |
| --- | --- |
| `stone-900`, `stone-800` (texto o fondo sólido) | `ink` |
| `stone-600`, `stone-500` (texto secundario) | `ink-muted` |
| `stone-200`, `stone-300` (bordes) | `border` |
| `stone-50`, `stone-100` (fondos sutiles) | `surface` |
| `white` | `paper` |

**Cambios de intención, no solo de nombre:**

- `Button` variante `primary` pasa de negro a **azul de marca**: fondo `brand`,
  texto `paper`, hover `brand-strong`. Es la acción principal del producto y
  debe llevar el color del producto.
- `Button` variante `secondary`: borde `border`, fondo `paper`, texto `ink`.
- `Button` variante `danger`: se queda en rojo. Es semántico, no de marca. Usa
  `--color-danger: #b42318` como token nuevo en el `@theme`.
- Estado de foco en `Input` y `Textarea`: anillo con `brand`.
- `.badge-unlisted`: fondo `ink`, texto `paper`.
- `.badge-published`: fondo `brand-soft`, texto `brand-strong`.
- `.badge-draft`: fondo `surface`, texto `ink-muted`, borde `border`.

---

## Fuera de alcance

- **No toques `src/app/public/pages/FeedLabPage.tsx`.** Es una maqueta temporal
  con datos falsos y se va a borrar. Sus 24 colores literales se quedan como
  están.
- No rediseñes ninguna pantalla. Esta tarea cambia colores y fuentes, **no
  layout, espaciado ni estructura**.
- No agregues modo oscuro.
- No toques el logo ni agregues gráficos.
- No apliques Yeseva One a nada todavía: los tokens quedan definidos, pero el
  sitio público aún no tiene pantallas reales que la usen.

---

## Criterios de aceptación

- [ ] `npm install` de los dos paquetes, sin ninguna otra dependencia nueva
- [ ] El `@theme` de `index.css` tiene los 9 tokens de color y los 2 de
      tipografía
- [ ] `grep -rE "stone-|slate-|gray-|zinc-" src/` no devuelve nada fuera de
      `FeedLabPage.tsx`
- [ ] El admin renderiza en Be Vietnam Pro
- [ ] En las herramientas de red del navegador, entrar a `/admin` **no**
      descarga el archivo de Yeseva One
- [ ] El botón primario es azul `#0D30F2` con texto blanco
- [ ] Los tres badges se distinguen entre sí y ninguno se lee como alerta
- [ ] Login, listado de proyectos y formulario se ven correctos, sin colores
      huérfanos ni contrastes rotos
- [ ] `npm run lint --prefix frontend` limpio
- [ ] `npm run build --prefix frontend` limpio

---

## Nota para después

Cuando existan las pantallas públicas, la escala display se aplica ahí. Y
cuando la diseñadora elija el `accent_color` de un proyecto, ese valor entra
como variable CSS en línea sobre la página del proyecto, sustituyendo a
`--color-brand` en ese árbol. Eso va en su propia spec.
