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
  @apply rounded-2xl border border-stone-200 bg-white p-8 shadow-sm;
}
```

#### `@layer components`

Zona recomendada para clases reutilizables de componente o bloque visual.

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

1. leer `App.tsx`
2. leer `admin/routes.tsx` y `public/routes.tsx`
3. entender `AdminLayout` y `PublicLayout`
4. leer `LoginPage`
5. leer `Button`, `Input`, `Card`
6. leer `components.css`
7. volver a `HomePage` y `DashboardPage`

## Ejercicio recomendado para practicar

1. crear `ProjectsPage.tsx`
2. agregar ruta `/admin/projects`
3. reutilizar `AdminLayout`
4. crear una clase semantica nueva para cabecera de pagina
5. crear una tarjeta de proyecto con `Card`
6. dejar solo utilidades cortas inline donde valga la pena

## Errores comunes a evitar

- mezclar CSS viejo del starter con Tailwind nuevo
- poner toda la UI en un solo archivo
- duplicar botones e inputs sin crear primitives
- abusar de `@apply` hasta perder la simplicidad de Tailwind
- no separar admin y publico

## Estado verificado

Comprobado al actualizar esta guia:

- `npm run lint --prefix frontend`
- `npm run build --prefix frontend`
