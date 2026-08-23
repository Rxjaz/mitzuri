# Fases de desarrollo

Revisado el `2026-08-23`. **Las ocho fases de la v1 están cerradas** y el
producto está en producción.

Este documento pasa de ser un plan a ser un registro: sirve para entender qué se
construyó, en qué orden y por qué. La planeación de la v2 aún no existe.

## Fase 0 — Fundación técnica · cerrada

- [x] Monorepo con `backend/`, `frontend/` y `docs/`
- [x] Postgres local por Docker
- [x] Runner de migraciones con checksum
- [x] ESLint en ambos paquetes
- [x] Cliente API base en el frontend
- [x] `.gitattributes` normalizando finales de línea a LF
- [x] `CLAUDE.md` con las convenciones del repositorio

Lo de los finales de línea no era cosmético: Windows los reescribía y cada
archivo tocado aparecía como reescrito entero, con lo que un diff de 12 archivos
reales llegaba como 43 archivos y 1300 líneas.

## Fase 1 — Auth admin · cerrada

- [x] Tabla `users` y seed
- [x] `login`, `logout`, `me`
- [x] `authMiddleware`
- [x] Sesión persistente con `AuthProvider`
- [x] Guards `ProtectedRoute` y `GuestRoute`
- [x] Token aislado en `token.storage.ts`

## Fase 2 — CRUD de proyectos · cerrada

- [x] Las siete operaciones, de punta a punta
- [x] Slug derivado del título, único
- [x] Tres estados: `draft`, `unlisted`, `published`
- [x] Slug congelado al salir de borrador, **para siempre**

Ese último punto corrigió un bug real: el slug solo se congelaba mientras el
proyecto estuviera publicado, así que despublicar lo liberaba y cambiar el
título rompía una URL ya compartida.

## Fase 3 — Base visual · cerrada

- [x] Tailwind 4 con tokens en el `@theme` de `index.css`
- [x] Tipografías propias, self-hosted: Yeseva One y Be Vietnam Pro
- [x] Paleta real: `#070707`, `#FFFFFF`, `#0D30F2`
- [x] Componentes base en `components/ui/`
- [x] Cero colores literales de Tailwind en el código

Se hizo antes de multiplicar pantallas, no después. La decisión resultó
correcta: cuando llegaron el feed y la página de proyecto, ya había con qué
construirlas.

## Fase 4 — Media · cerrada

- [x] `POST /admin/media` con subida real a R2
- [x] Ancho y alto leídos del archivo
- [x] Texto alternativo obligatorio y editable
- [x] Componente `ImageUpload`
- [x] Portada como llave foránea a `media_assets`

Lo último llegó tarde y con costo: mientras la portada fue una URL suelta, el
feed no sabía qué forma tenían las imágenes y las recortaba todas igual.

Sin cerrar, a propósito: derivados optimizados y limpieza de huérfanos.

## Fase 5 — Secciones · cerrada para el alcance decidido

- [x] Módulo `sections` completo: CRUD, reordenamiento, schema por tipo
- [x] Restricción diferible que hace posible reordenar
- [x] Galería en el admin, en pantalla propia
- [x] Render público de la galería

Solo existe el tipo `image`. El contenido real de la diseñadora es un párrafo
corto más imágenes, así que el sistema de bloques completo era artillería de
más. El mapa de schemas está listo para recibir `text` cuando haga falta.

## Fase 6 — Preview privada · cancelada

La tabla `project_preview_tokens` existe desde la migración `006` y nunca se
usó.

Su caso de uso —compartir trabajo sin publicarlo— lo resolvió el estado
`unlisted` de forma más simple: URL permanente, sin token que administrar. Lo
único que no cubre es enseñar un borrador a medias, y no apareció la necesidad.

Decisión cerrada el `2026-08-23`. La tabla debería eliminarse en una migración
futura.

## Fase 7 — Sitio público · cerrada

- [x] Feed en mosaico de dos columnas
- [x] Página por `slug`
- [x] Portadas a su proporción real, sin recorte
- [x] `title` y `meta description` por página
- [x] `noindex` en los proyectos no listados
- [x] Orden editorial con `sort_order`
- [x] Categoría, herramientas, acento y créditos

El reparto en columnas se hace en React alternando fichas, no con `columns` de
CSS: así el orden curado se lee de izquierda a derecha. En móvil colapsa a una
columna con el orden exacto.

Sin cerrar: Open Graph.

## Fase 8 — Calidad y operación · parcial

- [x] Deploy en producción: Vercel, Render, Neon y R2
- [x] Migraciones corriendo solas al arrancar
- [x] `/health` que comprueba la conexión a la base
- [x] Documentación de deploy con sus trampas
- [ ] **Tests**
- [ ] CI
- [ ] Observabilidad

No hay ni un test. Fue una decisión consciente mientras cada cambio pasaba por
una spec con criterios de aceptación y una auditoría del diff. Con contenido
real cargado, deja de serlo.

---

## Lo que sigue

El siguiente paso no es una fase técnica: es que la diseñadora cargue sus doce
proyectos y se anote todo lo que le cueste trabajo. La v2 se planea con esa
lista en la mano, no antes.

Los pendientes abiertos y su fecha de caducidad están en
[00_ESTADO_ACTUAL.md](00_ESTADO_ACTUAL.md).
