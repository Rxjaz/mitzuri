# Experiencia admin

Revisado el `2026-08-23`. Lo marcado existe y está en producción.

## Pantallas

- [x] `LoginPage`
- [x] `DashboardPage`
- [x] `ProjectsPage` — listado con acciones por fila
- [x] `ProjectFormPage` — alta y edición en la misma pantalla
- [x] `ProjectImagesPage` — galería del proyecto

La galería vive en pantalla propia y no dentro del formulario, a propósito: el
formulario guarda al presionar un botón y la galería guarda en cada acción.
Mezclar dos modelos de guardado en una pantalla confunde.

## Lo que puede hacer la diseñadora

- [x] editar datos base: título, descripción, cliente, año
- [x] elegir categoría, herramientas, color de acento y créditos
- [x] subir la portada desde su computadora
- [x] escribir el texto alternativo de cada imagen
- [x] decidir el orden del feed
- [x] mover un proyecto entre `draft`, `unlisted` y `published`
- [x] agregar, editar, reordenar y eliminar imágenes
- [x] abrir la URL pública del proyecto en una pestaña nueva

## Detalles de UX que sí se resolvieron

**Las acciones dependen del estado.** Un borrador ofrece publicar o compartir en
privado; un publicado ofrece quitarlo del feed o volverlo a borrador. No se
muestran transiciones que no tienen sentido desde donde está el proyecto.

**El peso visual de los tres estados sigue qué tan expuesto está el proyecto:**
borrador en gris fantasma, no listado en contorno, publicado en azul sólido. Se
lee de un vistazo cuál está vivo de cara al público.

**La URL avisa cuándo se congela.** El formulario muestra la dirección pública y
dice si todavía se regenera desde el título o si ya quedó fija para siempre.

**El color de acento avisa si no se lee.** Si tiene menos de 4.5:1 de contraste
sobre blanco, sale un aviso. Avisa, no bloquea: la decisión es de ella.

**Confirmación antes de borrar**, tanto un proyecto como una imagen.

**El texto alternativo es obligatorio.** No se puede guardar una imagen sin él.

## Flujo de trabajo

- [x] trabajar primero en borradores
- [x] compartir en privado para recibir comentarios de un cliente
- [x] publicar solo cuando el proyecto esté listo
- [x] quitar del feed sin perder la URL, si hace falta

## Lo que falta pulir

- **Sin aviso al guardar.** Guardar un proyecto redirige al listado y ya. No hay
  confirmación de que salió bien
- **Un proyecto publicado muestra cuatro acciones en su fila**, y se ve cargado
- **El texto alternativo, al rechazarse por vacío, deja el campo en blanco** en
  pantalla mientras la base conserva el valor anterior. Parece que se guardó
  vacío
- **Sin vista previa dentro del admin.** Para ver cómo quedó hay que abrir la
  URL pública en otra pestaña

Ninguno bloquea el trabajo. Se priorizan cuando la diseñadora use el panel de
verdad y sepamos cuáles le estorban.
