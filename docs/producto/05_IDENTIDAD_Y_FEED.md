# Identidad de proyecto y diseño del feed

Documento **cerrado** el `2026-08-23`. Registra las decisiones que se tomaron y
por qué, no una discusión abierta.

La maqueta que vivía en `/lab` se borró: cumplió su función de ayudar a elegir
dirección y el feed real ya existe.

## El problema que resolvía

Si todos los proyectos se pintan con la misma tarjeta, el portafolio se lee como
un feed de redes sociales: cuadros iguales en orden cronológico. Para un
portafolio de diseño eso es un defecto.

La tensión: **identidad por proyecto** contra **coherencia del conjunto**.
Demasiada libertad y parece plantilla rota; muy poca y parece catálogo.

## Las palancas, y qué pasó con cada una

### 1. Color de acento · implementado

Un hex por proyecto que, dentro de su página, **sustituye al azul del sitio**.
Como los tokens de Tailwind 4 son variables CSS, basta redefinir `--color-brand`
en el elemento raíz de la página y todo lo que use `brand` cambia solo.

La regla que lo ordena: azul, blanco y negro son la identidad **del sitio**; el
acento es la del **proyecto**. Nunca compiten en la misma pantalla.

El formulario avisa si el color tiene menos de 4.5:1 de contraste sobre blanco.
Avisa, no bloquea.

### 2. Peso en el feed · descartado, y resuelto de otra forma

Se planeó un campo `feed_size` con cuatro valores, para decidir a mano cuánto
espacio ocupa cada ficha.

Se descartó por dos razones. Primero, con cinco proyectos públicos un mosaico
asimétrico no se lee como revista, se lee como una cuadrícula rota. Y segundo,
resultó innecesario: al conocer el ancho y el alto reales de cada portada, **la
propia imagen decide su tamaño**. Una portada panorámica ocupa lo ancho que es y
una vertical lo alto que es, sin que nadie lo configure.

Cuatro casos de render menos y un campo menos que llenar doce veces.

### 3. Orden curado · implementado

`sort_order`. El orden del portafolio es una decisión editorial, no la fecha en
que se hizo cada cosa. Con pocos proyectos, cuál va primero importa más que
cuándo se hizo.

### 4. Tagline · pospuesto

Una línea de seis a diez palabras bajo el título, distinta de `description`, que
es de lectura larga.

Quedó fuera para no obligar a la diseñadora a tomar doce decisiones más mientras
carga su trabajo. Si con el feed lleno se siente escueto, agregar la columna
cuesta veinte minutos — y ahí la decisión se toma mirando, no imaginando.

### 5. Layout de página por proyecto · descartado

Era la palanca más cara: multiplicaba los casos de render. Con el acento
haciendo el trabajo de identidad, dejó de hacer falta.

## La variante elegida: editorial

De las tres que se maquetaron —editorial, índice tipográfico y sangre completa—
se eligió **editorial**: un destacado grande arriba y después un mosaico.

Por qué las otras no: el índice tipográfico esconde el trabajo visual detrás de
un hover y se cae en móvil, que es donde va a llegar buena parte de la gente. La
sangre completa exige portadas excelentes en **todos** los proyectos, sin
excepción, y obliga a un scroll larguísimo.

## Cómo quedó el mosaico

Dos columnas en escritorio, una en móvil. Y una decisión que no es obvia:

**el reparto en columnas se hace en React, alternando fichas** —la primera a la
izquierda, la segunda a la derecha, la tercera a la izquierda— en vez de usar
`columns` de CSS.

Con `columns`, las fichas fluyen hacia abajo llenando una columna antes de pasar
a la otra, así que leyendo de izquierda a derecha el orden curado se percibe
alterado. Alternando, se lee correcto. El precio es que las dos columnas pueden
terminar a alturas distintas, y con imágenes de formas parecidas casi no se nota.

Ninguna portada se recorta: cada marco toma la proporción real de su imagen.

## Categorías

Editorial, Marca e Ilustración. **Son las de la diseñadora**, tomadas de cómo
ella misma separa su trabajo, no una taxonomía inventada.

Fotografía aparecía en su lista y quedó fuera: tiene trabajo fotográfico pero no
quiere enfocarse ahí por ahora. Se puede agregar después sin tocar nada más que
la restricción de la base.

Se guardan sin acentos y en minúsculas —`ilustracion`— y la etiqueta legible se
arma en el frontend. Nunca se guarda texto de presentación en la base.

Con doce proyectos, la categoría es una **etiqueta**, no un filtro. No hay
navegación por categoría ni hace falta.
