# MITZURI - Centro de documentacion

Este directorio funciona como organizador para abrir solo el archivo que hace falta segun el momento de trabajo.

## Como usar esta carpeta

Si vas a trabajar hoy en una tarea tecnica:

- lee [docs/PLAN_DESARROLLO.md](PLAN_DESARROLLO.md)
- luego abre [docs/dev/05_WORKFLOW_DIARIO.md](dev/05_WORKFLOW_DIARIO.md)
- y consulta [docs/dev/04_FASES.md](dev/04_FASES.md)

Si necesitas entender el producto antes de construir:

- lee [docs/PLAN_PRODUCTO.md](PLAN_PRODUCTO.md)
- luego revisa [docs/producto/01_ALCANCE_V1.md](producto/01_ALCANCE_V1.md)

Si necesitas revisar tecnologias, dependencias, convenciones y herramientas reales del repo:

- abre [docs/STACK.md](STACK.md)

Si necesitas saber que existe hoy y que sigue faltando:

- abre [docs/dev/00_ESTADO_ACTUAL.md](dev/00_ESTADO_ACTUAL.md)

---

## Mapa de documentos

### Resumenes principales

- [docs/PLAN_DESARROLLO.md](PLAN_DESARROLLO.md): puerta de entrada tecnica.
- [docs/PLAN_PRODUCTO.md](PLAN_PRODUCTO.md): puerta de entrada funcional.
- [docs/STACK.md](STACK.md): stack real del proyecto.

### Desarrollo

- [docs/dev/00_ESTADO_ACTUAL.md](dev/00_ESTADO_ACTUAL.md): que existe hoy, que cambio y que falta.
- [docs/dev/01_ARQUITECTURA.md](dev/01_ARQUITECTURA.md): estructura tecnica real y estructura objetivo.
- [docs/dev/02_DATOS_Y_API.md](dev/02_DATOS_Y_API.md): tablas, contratos y endpoints.
- [docs/dev/03_SEGURIDAD_Y_REGLAS.md](dev/03_SEGURIDAD_Y_REGLAS.md): auth, preview, media y reglas de implementacion.
- [docs/dev/04_FASES.md](dev/04_FASES.md): roadmap tecnico por fases.
- [docs/dev/05_WORKFLOW_DIARIO.md](dev/05_WORKFLOW_DIARIO.md): rutina diaria y comandos base.

### Producto

- [docs/producto/00_VISION.md](producto/00_VISION.md): vision del producto.
- [docs/producto/01_ALCANCE_V1.md](producto/01_ALCANCE_V1.md): alcance funcional real de la v1.
- [docs/producto/02_EXPERIENCIA_PUBLICA.md](producto/02_EXPERIENCIA_PUBLICA.md): experiencia publica esperada.
- [docs/producto/03_EXPERIENCIA_ADMIN.md](producto/03_EXPERIENCIA_ADMIN.md): experiencia admin esperada.
- [docs/producto/04_REGLAS_FUNCIONALES.md](producto/04_REGLAS_FUNCIONALES.md): reglas clave de producto.

---

## Regla de mantenimiento

- Si un cambio describe comportamiento visible o valor para la disenadora o la visitante, va en `producto/`.
- Si un cambio describe implementacion, estructura, contratos, tooling o riesgos, va en `dev/`.
- Si un archivo crece tanto que deja de ser facil de consultar mientras trabajas, debe dividirse antes de seguir creciendo.