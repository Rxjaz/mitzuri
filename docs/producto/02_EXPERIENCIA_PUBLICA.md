# Experiencia pública

Revisado el `2026-08-23`. Lo marcado existe y está en producción.

## Lo que puede ver una visitante

- [x] un feed con los proyectos publicados
- [x] una página individual por proyecto
- [x] las imágenes del proyecto en el orden que decidió la diseñadora
- [x] información clara: categoría, cliente, año, herramientas y créditos

## Lo que no puede hacer

- [x] registrarse — no existe registro
- [x] entrar al admin — hay guard de rutas y el backend exige token
- [x] ver borradores — un `draft` no sale por ningún endpoint público

## Pantallas

- [x] Feed público en `/`
- [x] Página de proyecto en `/proyectos/:slug`
- [ ] ~~Preview privada por token~~ — sustituida por el estado `unlisted`

## El feed

Mosaico de dos columnas, con un destacado arriba a todo el ancho. El orden lo
decide `sort_order`, no la fecha: en un portafolio, cuál va primero es una
decisión editorial.

Dos detalles que costaron trabajo y explican cómo se ve:

**Ninguna portada se recorta.** Cada imagen conserva su proporción real, porque
el proyecto conoce el ancho y el alto de su portada. Un tren panorámico se ve
panorámico y una doble página vertical se ve vertical. Antes se metían todas en
un marco de proporción fija y se cortaban.

**El orden se lee de izquierda a derecha.** El reparto en columnas se hace
alternando fichas —la primera a la izquierda, la segunda a la derecha— en vez de
dejar que fluyan hacia abajo por columna, que es lo que hace un mosaico normal y
lo que habría alterado el orden curado. En móvil hay una sola columna y el orden
es exacto.

## La página de proyecto

De arriba a abajo: título en la tipografía display, categoría, cliente y año,
portada a su proporción real, descripción a ancho de lectura cómodo, la galería,
y los créditos si el proyecto fue colaborativo.

Si el proyecto tiene color de acento, **ese color sustituye al azul del sitio
dentro de su página**. Azul, blanco y negro son la identidad del sitio; el
acento es la del proyecto. Nunca compiten en la misma pantalla.

## Compartir en privado

Un proyecto `unlisted` no aparece en el feed pero responde por su URL. Es lo que
usa la diseñadora para enseñarle trabajo terminado a un cliente sin publicarlo
para todo el mundo.

Su página lleva `noindex, nofollow`. Sin eso, Google indexaría una URL
compartida en privado y el estado dejaría de significar nada.

## Requisitos de experiencia

- [x] las imágenes reservan su espacio antes de cargar, así el texto no salta
- [x] `alt` obligatorio en toda imagen
- [x] `title` y `meta description` por página
- [x] funciona en escritorio y en móvil
- [x] carga diferida en las imágenes que no se ven de entrada
- [ ] Open Graph por proyecto
- [ ] derivados optimizados de imagen

## Narrativa

La estructura pensada era: contexto, reto, proceso, solución, cierre.

Lo que existe hoy es más simple: un párrafo de descripción y una secuencia de
imágenes. Y coincide con cómo la diseñadora presenta su trabajo en su portafolio
real, donde cada proyecto es un párrafo corto y tres a cinco páginas de imágenes.

Si la narrativa en web pide más, el tipo de bloque `text` está previsto y el
sistema listo para recibirlo. Esa decisión se toma viendo contenido real, no
antes.
