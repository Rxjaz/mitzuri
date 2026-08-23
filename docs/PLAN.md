# MITZURI — Centro de documentación

Índice único de la documentación. Si buscas algo, empieza aquí.

Revisado el `2026-08-23`. La v1 está en producción.

## Por dónde entrar según lo que necesites

**Si acabas de llegar al proyecto**, en este orden:

1. [dev/00_ESTADO_ACTUAL.md](dev/00_ESTADO_ACTUAL.md) — qué existe hoy de verdad
2. [dev/08_COMO_TRABAJAMOS.md](dev/08_COMO_TRABAJAMOS.md) — el método de trabajo
3. [producto/01_ALCANCE_V1.md](producto/01_ALCANCE_V1.md) — qué se construyó y qué no

**Si vas a tocar el schema o un endpoint**: [dev/02_DATOS_Y_API.md](dev/02_DATOS_Y_API.md)

**Si vas a tocar carpetas o capas**: [dev/01_ARQUITECTURA.md](dev/01_ARQUITECTURA.md)

**Si vas a tocar estilos**: [dev/06_FRONTEND_Y_TAILWIND.md](dev/06_FRONTEND_Y_TAILWIND.md)

**Si vas a levantar el proyecto o diagnosticar producción**: [dev/05_WORKFLOW_DIARIO.md](dev/05_WORKFLOW_DIARIO.md)

**Si estás aprendiendo React o Tailwind**: [dev/07_GUIA_ESTUDIO_FRONTEND.md](dev/07_GUIA_ESTUDIO_FRONTEND.md)

## Mapa completo

### Desarrollo

| Documento | Qué contiene |
| --- | --- |
| [dev/00_ESTADO_ACTUAL.md](dev/00_ESTADO_ACTUAL.md) | Estado real, producción, deuda y pendientes abiertos |
| [dev/01_ARQUITECTURA.md](dev/01_ARQUITECTURA.md) | Estructura de carpetas, capas, montaje de la API, sesión |
| [dev/02_DATOS_Y_API.md](dev/02_DATOS_Y_API.md) | Migraciones, schema, endpoints y contratos de contenido |
| [dev/03_SEGURIDAD_Y_REGLAS.md](dev/03_SEGURIDAD_Y_REGLAS.md) | Auth, estados, media, y riesgos vigentes |
| [dev/04_FASES.md](dev/04_FASES.md) | Registro de las ocho fases de la v1 |
| [dev/05_WORKFLOW_DIARIO.md](dev/05_WORKFLOW_DIARIO.md) | Comandos, verificaciones y diagnóstico |
| [dev/06_FRONTEND_Y_TAILWIND.md](dev/06_FRONTEND_Y_TAILWIND.md) | Tokens, tipografía y los tres niveles de estilo |
| [dev/07_GUIA_ESTUDIO_FRONTEND.md](dev/07_GUIA_ESTUDIO_FRONTEND.md) | Guía conceptual de React, Router y Tailwind |
| [dev/08_COMO_TRABAJAMOS.md](dev/08_COMO_TRABAJAMOS.md) | Roles, ciclo por tarea, cómo se escribe una spec |

### Producto

| Documento | Qué contiene |
| --- | --- |
| [producto/00_VISION.md](producto/00_VISION.md) | Para quién y para qué existe |
| [producto/01_ALCANCE_V1.md](producto/01_ALCANCE_V1.md) | Qué entró en la v1 y qué cambió sobre la marcha |
| [producto/02_EXPERIENCIA_PUBLICA.md](producto/02_EXPERIENCIA_PUBLICA.md) | Qué ve una visitante |
| [producto/03_EXPERIENCIA_ADMIN.md](producto/03_EXPERIENCIA_ADMIN.md) | Qué puede hacer la diseñadora |
| [producto/04_REGLAS_FUNCIONALES.md](producto/04_REGLAS_FUNCIONALES.md) | Reglas de publicación, URLs, orden y SEO |
| [producto/05_IDENTIDAD_Y_FEED.md](producto/05_IDENTIDAD_Y_FEED.md) | Decisiones de identidad visual y diseño del feed |

### Especificaciones

`docs/specs/` guarda una spec por tarea ejecutada, con su razonamiento y sus
criterios de aceptación. Son el registro de **por qué** cada cosa está como
está.

| Spec | Tema |
| --- | --- |
| [01](specs/01_estado_unlisted.md) | Tercer estado y bloqueo permanente del slug |
| [02](specs/02_sistema_visual.md) | Tokens de color y tipografía propia |
| [03](specs/03_subida_de_portada.md) | Primer corte de media, subida a R2 |
| [04](specs/04_sitio_publico_minimo.md) | Feed y página por slug |
| [05](specs/05_galeria_de_proyecto.md) | Galería de imágenes por proyecto |
| [06](specs/06_portada_con_proporcion.md) | La portada deja de ser una URL |
| [07](specs/07_metadatos_de_portafolio.md) | Categorías, herramientas, acento y créditos |
| [08](specs/08_deploy.md) | Deploy a producción |

### Otros

| Documento | Qué contiene |
| --- | --- |
| [STACK.md](STACK.md) | Tecnologías y dependencias reales |
| [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md) | Redirección a este índice |
| [PLAN_PRODUCTO.md](PLAN_PRODUCTO.md) | Redirección a este índice |

## Carpetas que no se versionan

`docs/privado/` guarda material del cliente: portafolios, archivos con datos
personales. Está en `.gitignore` y **su contenido nunca se copia a un archivo
versionado ni se cita en el código**. El repositorio es público.

## Regla de mantenimiento

- Si describe comportamiento visible o valor para la diseñadora o la visitante,
  va en `producto/`
- Si describe implementación, estructura, contratos o riesgos, va en `dev/`
- Si es el registro de una tarea concreta con sus criterios, va en `specs/`
- La documentación se actualiza **cuando el comportamiento ya existe de verdad**,
  no cuando se planea
