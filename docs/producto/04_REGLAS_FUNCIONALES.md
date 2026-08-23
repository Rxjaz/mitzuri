# Reglas funcionales

Revisado el `2026-08-23`. Lo marcado se cumple en producción.

## Publicación

- [x] solo los proyectos `published` aparecen en el feed
- [x] un `draft` no es accesible por ninguna vía pública
- [x] al despublicar, el proyecto vuelve a `draft`
- [x] publicar fija `published_at`; volver a borrador lo limpia

## Compartir en privado

Sustituyó a la preview por token.

- [x] un proyecto `unlisted` responde por su URL
- [x] no aparece en el feed
- [x] su página lleva `noindex, nofollow`
- [x] se puede dejar de compartir moviéndolo a otro estado

## La URL de un proyecto

Esta es la regla menos visible y la que más caro sale romper.

- [x] el `slug` lo deriva el backend desde el título, nunca lo manda el cliente
- [x] mientras el proyecto es borrador, el slug sigue al título
- [x] **al salir de borrador, el slug se congela para siempre**
- [x] volver a borrador **no** lo desbloquea

El motivo: una vez que una dirección pudo compartirse con alguien, no se
recicla. Antes el slug solo se congelaba mientras el proyecto estuviera
publicado, así que despublicar lo liberaba y cambiar el título rompía en
silencio una URL que un cliente ya tenía.

## Orden

- [x] el orden del feed es editorial, por `sort_order`, no cronológico
- [x] cada imagen de un proyecto tiene una posición única dentro de él
- [x] reordenar es estable y no deja huecos
- [x] borrar una imagen renumera las que quedan

## Eliminación

- [x] borrar un proyecto arrastra sus secciones
- [ ] borrar un proyecto **no** borra sus archivos de R2

Lo segundo es deuda aceptada: con este volumen, limpiar a mano cuesta menos que
automatizarlo.

## SEO y presentación

- [x] `title` propio en cada página pública
- [x] `meta description` a partir de la descripción del proyecto
- [x] URL limpia por `slug`
- [x] `alt` obligatorio en toda imagen, incluida la portada
- [x] las páginas no listadas no se indexan
- [ ] Open Graph por proyecto

## Identidad visual

- [x] el sitio usa azul, blanco y negro para que el trabajo ponga el color
- [x] cada proyecto puede tener su color de acento
- [x] dentro de la página de un proyecto, ese acento sustituye al azul
- [x] el admin avisa si un acento no tiene contraste suficiente sobre blanco

## Regla editorial

- [x] el modelo de contenido permite intención narrativa
- [x] el sitio respeta el orden exacto de las imágenes
- [x] el orden es parte del producto, no un detalle

La libertad del editor quedó deliberadamente acotada: existe un solo tipo de
bloque, `image`, porque el contenido real de la diseñadora es un párrafo corto
más imágenes. El sistema está preparado para recibir más tipos, pero no se
agregan sin un caso de uso real.
