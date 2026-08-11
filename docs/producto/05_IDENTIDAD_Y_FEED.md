# Identidad de proyecto y diseno del feed

Documento de decision, abierto. Existe porque el feed publico se tiene que
resolver **antes** de modelar los campos, no despues.

Maqueta viva en `/lab` (`frontend/src/app/public/pages/FeedLabPage.tsx`).
Es temporal y con datos falsos; se borra cuando la direccion este elegida.

## El problema

Si todos los proyectos se pintan con la misma tarjeta, el portafolio se lee
como un feed de Instagram: cuadros iguales en orden cronologico. Para un
portafolio de diseno eso es un defecto, no un estilo. Cada proyecto deberia
poder verse distinto sin que el sitio pierda unidad.

La tension a resolver: **identidad por proyecto** contra **coherencia del
conjunto**. Demasiada libertad y parece plantilla rota; muy poca y parece
catalogo.

## Palancas de identidad, de mas barata a mas cara

1. **Color de acento** (`accent_color`). Un solo hex por proyecto que tine el
   titulo, la linea de la cita y el fondo del encabezado en su pagina, y el
   hover en el feed. Es la palanca con mejor relacion identidad/esfuerzo.
2. **Peso en el feed** (`feed_size`: `hero`, `wide`, `regular`, `tall`).
   Decide cuanto espacio ocupa la ficha. Es lo que rompe la cuadricula
   uniforme y hace que el feed se lea como una revista.
3. **Orden curado** (`sort_order`) y **destacado** (`is_featured`). El orden
   deja de ser cronologico y pasa a ser una decision editorial.
4. **Tagline** (`tagline`). Una linea corta bajo el titulo. Ya existe
   `description`, pero esa es de lectura larga; en el feed se necesita algo
   de seis a diez palabras.
5. **Layout de la pagina** (`page_layout`: `editorial`, `full_bleed`,
   `minimal`). La palanca mas cara: multiplica los casos de render.

Las opciones 1 a 4 son cuatro columnas y ningun caso nuevo de render.
La 5 conviene dejarla para despues, cuando existan secciones.

## Variantes de feed en la maqueta

### A · Editorial

Destacado grande arriba, despues mosaico asimetrico donde cada proyecto
ocupa el ancho que le corresponde por su `feed_size`.

- a favor: es el que mejor combina jerarquia e identidad, y funciona con
  pocos proyectos igual que con muchos
- en contra: depende de que las portadas esten bien recortadas

### B · Indice

Lista tipografica numerada. La portada aparece flotando al pasar el mouse.

- a favor: muy de estudio de diseno, sobrio, rapidisimo de cargar
- en contra: en movil pierde casi toda la gracia, y esconde el trabajo
  visual detras de un hover

### C · Sangre completa

Un proyecto por pantalla, portada a sangre, el color del proyecto manda.

- a favor: el maximo de identidad por proyecto
- en contra: obliga a hacer scroll largo para ver todo y necesita portadas
  excelentes en todos los proyectos, sin excepcion

### D · Pagina de proyecto

Encabezado tenido con el acento, portada ancha, y bloques alternados de
texto, par de imagenes, cita y galeria. Sigue la narrativa del documento
`02_EXPERIENCIA_PUBLICA.md`: contexto, reto, proceso, solucion, cierre.

Los bloques de esta maqueta son, a proposito, los mismos `type` que despues
tendra la tabla `sections`: `image`, `text`, `image_pair`, `quote`,
`gallery`.

## Pendiente de decidir

- [ ] variante de feed elegida
- [ ] si `accent_color` lo elige la disenadora o se extrae de la portada
- [ ] si `feed_size` es libre o el sistema solo permite un destacado
- [ ] migracion con los campos nuevos, una vez elegido lo anterior
