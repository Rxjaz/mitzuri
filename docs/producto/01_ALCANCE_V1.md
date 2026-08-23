# Alcance v1

**La v1 está completa y en producción desde el `2026-08-23`.**

## Decisiones de producto

- [x] Una sola usuaria administradora
- [x] Sin registro público
- [x] Solo `login` privado
- [x] Listado público de proyectos
- [x] Página pública individual por `slug`
- [x] El contenido se construye por bloques ordenados
- [x] El frontend se divide en área pública y admin
- [x] Ruta pública `/`, ruta privada `/admin`

Dos decisiones cambiaron sobre la marcha, y las dos a mejor:

**Tipos de bloque.** Se planearon cinco —`heading`, `text`, `image`,
`beforeAfter`, `gallery`— y se implementó uno: `image`. El contenido real de la
diseñadora es un párrafo corto más tres a cinco imágenes; los otros cuatro no
tenían caso de uso y multiplicaban los casos de render. `text` queda previsto.

**Preview privada.** Se sustituyó por un tercer estado, `unlisted`. Ver abajo.

## El objetivo real de la v1, cumplido

La v1 era exitosa cuando la diseñadora pudiera:

- [x] iniciar sesión
- [x] crear un proyecto `draft`
- [x] editar datos base
- [x] agregar, editar, eliminar y reordenar imágenes
- [x] asociar imágenes
- [x] compartir un proyecto en privado
- [x] publicar
- [x] ver el proyecto en el sitio público
- [x] compartir la URL pública

## `unlisted` en vez de preview por token

El sexto punto decía "abrir preview privada", y se resolvió distinto.

La preview por token era temporal y revocable, pensada para enseñar un borrador
antes de publicarlo. Pero al describir cómo trabaja la diseñadora apareció otra
necesidad, más frecuente: un proyecto **terminado** que no aparece en el feed
público pero tiene URL permanente para compartir con un cliente.

Eso no es una preview, es un tercer estado. Y resuelve el caso real sin
administrar tokens ni caducidades.

Lo único que `unlisted` no cubre es enseñar un borrador a medias. No apareció la
necesidad, así que la preview por token se declaró muerta.

## Incluido en la v1

- [x] login admin con sesión persistente
- [x] dashboard privado
- [x] CRUD de proyectos, con tres estados
- [x] galería de imágenes por proyecto, con reordenamiento
- [x] subida de media a Cloudflare R2
- [x] publicación manual
- [x] compartir en privado por URL
- [x] listado público de publicados
- [x] página pública individual por `slug`
- [x] metadatos: categoría, herramientas, color de acento y créditos
- [x] deploy en producción

## Fuera de foco, y sigue estándolo

- registro público
- múltiples administradoras
- funcionalidades sociales
- un editor excesivamente libre sin contratos claros
- paginación, búsqueda o filtros: el portafolio tendrá alrededor de doce
  proyectos, y de esos unos cinco públicos

## Lo que la v1 no incluyó y podría entrar después

- **Open Graph** por proyecto, para que un enlace compartido en redes o
  mensajería muestre la portada
- **`tagline`**: una línea de seis a diez palabras bajo el título, para el feed
- **tipo de bloque `text`**, si la narrativa en web necesita más que un párrafo
- **tests**, que no existen

Ninguno se decide antes de que la diseñadora cargue su trabajo real. Con el feed
lleno, esas conversaciones son concretas; hoy serían suposiciones.
