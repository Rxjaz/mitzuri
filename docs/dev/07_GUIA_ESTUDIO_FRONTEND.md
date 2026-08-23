# Guia de estudio del frontend actual

Documento pensado para retomar el proyecto desde cero conceptual, aun si casi no has usado `React` o `Tailwind`.

## Objetivo de esta guia

Entender:

1. que se modifico
2. por que se modifico
3. como se conecta cada archivo
4. que conceptos necesitas dominar para seguir por tu cuenta

## Mapa mental minimo

Piensa el frontend en 4 capas:

1. `React`: pinta la UI con componentes
2. `React Router`: decide que pantalla mostrar segun la URL
3. `services`: hablan con el backend
4. `Tailwind + CSS semantico`: definen como se ve la UI

## Que se cambio

### 1. Se instalo y activo Tailwind en el frontend

Archivos clave:

- [frontend/package.json](../../frontend/package.json)
- [frontend/vite.config.ts](../../frontend/vite.config.ts)
- [frontend/src/index.css](../../frontend/src/index.css)

Que significa:

- `tailwindcss` genera utilidades CSS
- `@tailwindcss/vite` integra Tailwind con Vite
- `@import "tailwindcss";` carga Tailwind en la app

### 2. Se limpio el CSS del starter de Vite

Archivos clave:

- [frontend/src/index.css](../../frontend/src/index.css)
- [frontend/src/App.css](../../frontend/src/App.css)

Que significa:

- se elimino ruido visual del proyecto demo
- ya no dependes de estilos del starter
- la base visual ahora es tuya

### 3. Se monto ruteo real

Archivos clave:

- [frontend/src/App.tsx](../../frontend/src/App.tsx)
- [frontend/src/app/admin/routes.tsx](../../frontend/src/app/admin/routes.tsx)
- [frontend/src/app/public/routes.tsx](../../frontend/src/app/public/routes.tsx)

Que significa:

- `App.tsx` ya no pinta una sola pantalla fija
- ahora monta rutas
- `admin` y `public` quedaron separados

### 4. Se agregaron layouts

Archivos clave:

- [frontend/src/app/admin/layout/AdminLayout.tsx](../../frontend/src/app/admin/layout/AdminLayout.tsx)
- [frontend/src/app/public/layout/PublicLayout.tsx](../../frontend/src/app/public/layout/PublicLayout.tsx)

Que significa:

- un `layout` es el cascaron comun de varias pantallas
- normalmente contiene header, nav y contenedor principal
- luego adentro cambia el contenido via `Outlet`

### 5. Se agregaron componentes UI base

Archivos clave:

- [frontend/src/components/ui/Button.tsx](../../frontend/src/components/ui/Button.tsx)
- [frontend/src/components/ui/Input.tsx](../../frontend/src/components/ui/Input.tsx)
- [frontend/src/components/ui/Card.tsx](../../frontend/src/components/ui/Card.tsx)

Que significa:

- en vez de repetir siempre el mismo boton o input
- defines una pieza reutilizable
- luego la personalizas con props o clases extra

### 6. Se creo un helper de clases

Archivo clave:

- [frontend/src/lib/cn.ts](../../frontend/src/lib/cn.ts)

Que significa:

- junta clases CSS de forma condicional
- hoy es una version simple con `join`
- luego podrias migrarlo a `clsx` o `tailwind-merge`

### 7. Se adopto un patron mixto para Tailwind

Archivo clave:

- [frontend/src/styles/components.css](../../frontend/src/styles/components.css)

Que significa:

- no todo queda inline en `className`
- tampoco todo se convierte en componentes React
- varias combinaciones de utilidades se agrupan en clases semanticas usando `@apply`

## Conceptos que debes entender

### React

#### Componente

Una funcion que devuelve UI.

Ejemplo real:

- `HomePage`
- `LoginPage`
- `Button`

#### Props

Datos que un componente recibe.

Ejemplo real:

- `Button` recibe `children`, `className`, `type`, `disabled`

#### State

Datos internos del componente que cambian con el tiempo.

Ejemplo real en `LoginPage`:

- `email`
- `password`
- `error`
- `loading`

#### Evento

Una accion del usuario, por ejemplo submit de formulario o cambio de input.

Ejemplo real:

- `handleSubmit`
- `onChange`

### React Router

#### Route

Relaciona una URL con un componente.

Ejemplo:

- `/admin/login` -> `LoginPage`

#### Layout route

Ruta contenedora que comparte estructura.

Ejemplo:

- `/admin` usa `AdminLayout`

#### Outlet

Lugar donde se renderiza la pantalla hija dentro del layout.

### Tailwind

#### Utilidad

Clase pequena que hace una sola cosa.

Ejemplos:

- `flex`
- `px-6`
- `text-sm`
- `rounded-2xl`

#### `@apply`

Permite combinar utilidades dentro de una clase CSS propia.

Ejemplo conceptual:

```css
.panel-card {
  @apply rounded-2xl border border-border bg-paper p-8 shadow-sm;
}
```

#### `@layer components`

Zona recomendada para clases reutilizables de componente o bloque visual.

#### `@theme` y los tokens

Este es el concepto mas importante del sistema visual, y es propio de Tailwind 4.

En `src/index.css` hay un bloque `@theme` donde viven los colores y las
tipografias del proyecto:

```css
@theme {
  --color-ink: #070707;
  --color-brand: #0d30f2;
  --font-display: "Yeseva One", Georgia, serif;
}
```

Tailwind genera las utilidades a partir de ahi: `bg-brand`, `text-ink`,
`font-display`. Existen porque los declaraste tu, no porque vengan de fabrica.

**Regla dura del proyecto: prohibido usar colores literales de Tailwind.** Nada
de `stone-900`, `blue-600` ni `gray-100`. Solo tokens.

Por que importa: antes de tener tokens, cada componente traia el gris que
alguien eligio sin decidirlo de verdad, y esa paleta accidental se heredaba de
pantalla en pantalla. Con tokens, cambiar un hex cambia el sitio entero.

Y como son variables CSS normales, se pueden redefinir en un subarbol. Asi
funciona el color de acento de cada proyecto:

```tsx
<article style={{ "--color-brand": project.accent_color }}>
```

Todo lo que use `brand` dentro de ese `article` cambia solo.

### Arquitectura de estilos que quedo

Hay 3 formas de aplicar estilos:

1. utilidades inline
2. clases semanticas en `components.css`
3. componentes UI reutilizables

## Como leer el flujo actual

### Caso 1: entrar a `/`

1. `main.tsx` monta `App`
2. `App.tsx` monta el router
3. `PublicRoutes()` registra la ruta `/`
4. `/` usa `PublicLayout`
5. el `Outlet` de `PublicLayout` renderiza `HomePage`

### Caso 2: entrar a `/admin/login`

1. `App.tsx` monta el router
2. `AdminRoutes()` registra `/admin/login`
3. la ruta renderiza `LoginPage`
4. `LoginPage` usa `Card`, `Input` y `Button`
5. al enviar el formulario se llama `login()` desde `auth.service.ts`

## Como decidir donde poner algo nuevo

### Si creas una nueva pantalla

Va en:

- `src/app/admin/pages/` si es privada
- `src/app/public/pages/` si es publica

### Si agregas una nueva ruta

Va en:

- `src/app/admin/routes.tsx`
- `src/app/public/routes.tsx`

### Si repites un patron visual

Va en:

- `src/styles/components.css`

### Si repites una pieza HTML con props

Va en:

- `src/components/ui/`

### Si hablas con backend

Va en:

- `src/services/`

## Como usar el patron sin ensuciar TSX

### Opcion A: clase semantica

```tsx
<section className="panel-card-soft">
  <h1 className="hero-title">Mitzuri</h1>
</section>
```

Usala cuando el patron es visual.

### Opcion B: componente UI

```tsx
<Button className="w-full">Guardar</Button>
```

Usalo cuando el patron tiene estructura reutilizable.

### Opcion C: utilidad corta inline

```tsx
<div className="mt-6">
```

Usala cuando el ajuste es pequeno y local.

## Recomendaciones practicas

- no conviertas cada `div` en un componente
- no conviertas cada clase utilitaria en una clase semantica
- primero repite 2 o 3 veces, luego abstrae
- usa nombres semanticos, no visuales puros
- preferir `panel-card` sobre `white-box-large`
- si un estilo solo vive en una pantalla y es corto, dejalo inline

## Orden de estudio recomendado

De lo mas simple a lo mas enredado:

1. `index.css` — los tokens. Todo lo visual sale de ahi
2. `App.tsx` y los dos `routes.tsx`
3. `AdminLayout` y `PublicLayout`
4. `Button`, `Input`, `Select` — los componentes base
5. `components.css` — las clases semanticas
6. `apiClient.ts` — como se habla con el backend
7. `AuthProvider.tsx` — el estado de sesion. Es lo mas denso del frontend
8. `HomePage.tsx` — el feed, con el reparto en columnas
9. `ProjectImagesPage.tsx` — la pantalla mas completa: carga, sube, edita,
   reordena y borra

## Ejercicios para practicar

Con dificultad creciente, y los tres son cosas que el proyecto de verdad
necesita:

**Uno.** Agrega un token de color nuevo al `@theme` y usalo en un componente.
Comprueba que aparece como utilidad sin configurar nada mas.

**Dos.** El pie de pagina publico no tiene enlace al correo de contacto.
Agregalo usando solo tokens y clases existentes.

**Tres.** En `ProjectImagesPage`, si borras el texto alternativo y sales del
campo, sale el aviso de que es obligatorio pero el campo se queda vacio en
pantalla mientras la base conserva el valor anterior. Arreglalo restaurando el
valor previo. Es un bug real y esta anotado en `00_ESTADO_ACTUAL.md`.

## Errores comunes a evitar

- usar un color literal de Tailwind "solo por esta vez"
- usar `font-display` por debajo de 24px, o intentar ponerle negritas
- hacer `fetch` directo desde un componente en vez de pasar por `apiClient`
- tocar `localStorage` fuera de `token.storage.ts`
- poner toda la UI en un solo archivo
- duplicar botones e inputs sin crear primitives
- abusar de `@apply` hasta perder la simplicidad de Tailwind

## Estado verificado

Comprobado al actualizar esta guia el `2026-08-23`:

- `npm run lint --prefix frontend`
- `npx tsc -b`
- `grep -rE "stone-|slate-|gray-|zinc-" frontend/src` sin resultados
