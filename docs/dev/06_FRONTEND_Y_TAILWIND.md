# Frontend y Tailwind

## Estado actual

Hoy el frontend ya tiene estas piezas reales:

- `react-router-dom`
- `apiClient`
- `auth.service`
- `LoginPage`
- ruta `/admin`
- plugin de Tailwind activo en `frontend/vite.config.ts`
- import global de Tailwind en `frontend/src/index.css`
- archivo de clases semanticas en `frontend/src/styles/components.css`
- componentes UI base en `frontend/src/components/ui/`

La base heredada del starter de Vite ya se limpio. `App.css` quedo vacio y `index.css` ahora funciona como entrada minima de estilos globales.

## Decision recomendada

Si vas a introducir Tailwind, el mejor momento es ahora, antes de construir:

- dashboard admin
- lista de proyectos
- formulario de proyecto
- editor de secciones

No conviene posponerlo hasta despues, porque cada pantalla nueva aumentaria el costo de migracion.

## Objetivo de Tailwind en este proyecto

Tailwind no deberia entrar para "decorar" la app actual. Deberia entrar para resolver tres cosas:

1. velocidad al construir el admin
2. consistencia visual desde componentes pequenos
3. base reutilizable para el futuro sitio publico

## Alcance recomendado de la adopcion

### Si

- usar Tailwind como base de layout, espaciado, tipografia y estados
- definir un set chico de patrones reutilizables
- combinar utilidades con componentes pequenos propios
- conservar CSS plano solo para resets o casos muy especificos

### No

- meter una libreria UI grande antes de entender bien el CMS
- mezclar Tailwind con mucho CSS heredado del starter
- construir un design system enorme antes de tener pantallas reales

## Implementacion real que ya quedo montada

El repo ya quedo en este estado:

1. `tailwindcss` y `@tailwindcss/vite` viven en `frontend/package.json`.
2. `frontend/vite.config.ts` usa `tailwindcss()` junto al plugin de React.
3. `frontend/src/index.css` importa:
   - `tailwindcss`
   - `./styles/components.css`
4. `frontend/src/styles/components.css` concentra clases semanticas armadas con `@apply`.
5. `frontend/src/components/ui/` ya tiene una base minima:
   - `Button.tsx`
   - `Input.tsx`
   - `Card.tsx`
6. `frontend/src/lib/cn.ts` ya existe para concatenar clases.
7. `LoginPage`, `AdminLayout`, `PublicLayout`, `DashboardPage` y `HomePage` ya usan esta base.

## Patron de estilos recomendado

### Nivel 1: utilidades Tailwind

Usalas cuando el ajuste es pequeno y local.

Ejemplo:

- `className="w-full"`
- `className="mt-6"`

### Nivel 2: clases semanticas en CSS

Usalas cuando un bloque visual:

- se repite
- tiene muchas utilidades
- ya expresa una intencion clara

Ejemplos reales:

- `.panel-card`
- `.app-header`
- `.auth-card`
- `.hero-title`

Esas clases viven en `frontend/src/styles/components.css` dentro de `@layer components`.

### Nivel 3: componentes React

Usalos cuando una pieza:

- tiene estructura HTML repetida
- recibe props
- combina comportamiento y presentacion

Ejemplos reales:

- `Button`
- `Input`
- `Card`

## Regla practica

- si se repite solo estilo: crear clase semantica en CSS
- si se repite estructura y props: crear componente React
- si el ajuste es unico y corto: dejar utilidades inline

## Estructura frontend vigente

```text
frontend/src/
|-- app/
|   |-- admin/
|   |   |-- layout/
|   |   |-- pages/
|   |   |-- routes.tsx
|   `-- public/
|       |-- layout/
|       |-- pages/
|       `-- routes.tsx
|-- components/
|   |-- ui/
|   |-- admin/
|   `-- shared/
|-- lib/
|   `-- cn.ts
|-- styles/
|   `-- components.css
|-- services/
`-- types/
```

## Riesgos a evitar

- empezar por estilos del sitio publico antes del admin
- volver a meter CSS heredado del starter sin criterio
- crear demasiadas abstracciones de UI antes de tener 2 o 3 pantallas reales
- meter `shadcn/ui` demasiado pronto si aun no esta claro el lenguaje visual
- esconder toda utilidad dentro de clases semanticas; eso elimina parte del beneficio de Tailwind

## Mejor paso estrategico para seguir

El siguiente paso estrategico no es `media`, ni `sections`, ni el sitio publico. Es este:

`cerrar el slice admin base: login -> sesion -> dashboard minimo -> proyectos`

Dentro de ese slice, Tailwind entra como habilitador, no como iniciativa separada.

## Orden concreto recomendado

1. Confirmar flujo de auth frontend con `getMe` y redireccion basica.
2. Endurecer guard de rutas admin.
3. Reusar la shell admin y componentes UI base ya creados.
4. Implementar `projects.service.ts`.
5. Crear `ProjectsPage` con listado.
6. Crear formulario minimo para alta y edicion.
7. Despues pasar a `media`.

## Criterio para saber si el paso ya quedo bien

Vas en la direccion correcta cuando puedas:

- hacer login
- mantener sesion
- entrar a `/admin`
- ver proyectos
- crear o editar un proyecto
- hacerlo todo en una UI ya consistente
