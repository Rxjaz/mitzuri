# Fases de desarrollo

Estas fases ya consideran el estado real del repo al `2026-05-28`.

## Fase 0 - Fundacion tecnica

Objetivo:

Dejar estable la base comun para avanzar sin contradicciones entre backend, DB y frontend.

### Ya logrado

- [x] Monorepo base
- [x] Postgres local por Docker
- [x] Runner de migraciones con checksum
- [x] Migraciones iniciales
- [x] ESLint backend y frontend
- [x] Estructura base de carpetas frontend
- [x] Estructura modular base en backend
- [x] Cliente API base frontend
- [x] Ruteo frontend minimo

### Falta cerrar

- [ ] Guard privado frontend para admin
- [ ] Shell base del admin
- [ ] Sustituir estilos starter por sistema visual propio
- [ ] Documentar `.env.example` si el setup deja de ser solo personal

## Fase 1 - Auth admin

Objetivo:

Tener acceso privado realmente util para trabajar el CMS.

### Ya logrado

- [x] Tabla `users`
- [x] Seed admin
- [x] `POST /auth/login`
- [x] `POST /auth/logout`
- [x] `GET /auth/me`
- [x] Middleware auth base
- [x] Proteccion backend de `/admin/projects`
- [x] UI base de login

### Falta cerrar

- [ ] Persistencia y restauracion robusta de sesion en frontend
- [ ] Guard de rutas admin
- [ ] Estado global o proveedor de auth si la UI crece
- [ ] Decidir si el modelo de token simple sera suficiente

## Fase 2 - CRUD de proyectos

Objetivo:

Permitir crear y administrar proyectos base sin tocar la base manualmente.

### Ya logrado

- [x] Crear proyecto
- [x] Listar proyectos
- [x] Ver proyecto por id
- [x] Editar proyecto
- [x] Eliminar proyecto
- [x] Publicar y despublicar
- [x] Conectar este CRUD a una UI admin real
- [x] Agregar servicio frontend de `projects`
- [x] Crear listado y formulario minimo
- [x] Slug siempre derivado del titulo, unico, y congelado al publicar
- [x] `cover_image_url` se puede poner y limpiar desde la UI

### Falta cerrar

- [ ] Validar reglas adicionales de publicacion si se necesitan
- [ ] Feedback de exito tras guardar, hoy solo redirige al listado
- [ ] Campos de identidad del proyecto, ver [05_IDENTIDAD_Y_FEED.md](../producto/05_IDENTIDAD_Y_FEED.md)

## Fase 3 - Base visual del admin

Objetivo:

Definir una base de UI reutilizable antes de multiplicar pantallas.

### Falta casi todo

- [ ] Instalar Tailwind
- [ ] Definir tokens base de espaciado, tipografia y color
- [ ] Crear layout de admin
- [ ] Crear componentes base de formulario, boton, card, estado vacio y feedback

Nota:

Esta fase conviene hacerla junto con Fase 1 y Fase 2, no al final. La razon es simple: hoy la superficie del frontend aun es chica y cambiar de estrategia visual despues costaria mas.

## Fase 4 - Media

Objetivo:

Resolver el manejo de imagenes antes del editor narrativo completo.

### Ya logrado

- [x] Tabla `media_assets`
- [x] Cliente R2 configurado

### Falta cerrar

- [ ] Endpoints de media
- [ ] Subida real
- [ ] Asociacion con proyectos y secciones
- [ ] Validacion `alt`
- [ ] Estrategia de derivados optimizados

## Fase 5 - Secciones y narrativa

Objetivo:

Construir el corazon del CMS.

### Ya logrado

- [x] Tabla `sections`

### Falta cerrar

- [ ] Modulo `sections`
- [ ] CRUD de bloques
- [ ] Reordenamiento
- [ ] Schemas por tipo
- [ ] Render frontend por `type`

## Fase 6 - Preview privada

Objetivo:

Permitir revisar y compartir proyectos antes de publicarlos.

### Ya logrado

- [x] Tabla `project_preview_tokens`

### Falta cerrar

- [ ] Generacion de token
- [ ] Invalidacion o regeneracion
- [ ] Endpoint publico por token
- [ ] Pantalla frontend de preview

## Fase 7 - Sitio publico

Objetivo:

Exponer el portafolio publicado.

### Falta casi todo

- [ ] Home publica
- [ ] Listado publico de proyectos
- [ ] Pagina por `slug`
- [ ] Render de bloques
- [ ] SEO base

## Fase 8 - Calidad y operacion

Objetivo:

Reducir deuda operativa antes de crecimiento o deploy serio.

### Falta casi todo

- [ ] Tests backend
- [ ] Tests frontend
- [ ] CI
- [ ] Documentacion de deploy
- [ ] Observabilidad minima
