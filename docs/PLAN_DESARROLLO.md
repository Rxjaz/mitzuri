# MITZURI - Resumen de desarrollo

Este archivo es una puerta de entrada corta. El detalle tecnico ya vive en `docs/dev/`.

## Que leer primero

- Estado real del repo: [docs/dev/00_ESTADO_ACTUAL.md](dev/00_ESTADO_ACTUAL.md)
- Arquitectura: [docs/dev/01_ARQUITECTURA.md](dev/01_ARQUITECTURA.md)
- Datos y API: [docs/dev/02_DATOS_Y_API.md](dev/02_DATOS_Y_API.md)
- Seguridad y reglas: [docs/dev/03_SEGURIDAD_Y_REGLAS.md](dev/03_SEGURIDAD_Y_REGLAS.md)
- Roadmap tecnico: [docs/dev/04_FASES.md](dev/04_FASES.md)
- Trabajo diario: [docs/dev/05_WORKFLOW_DIARIO.md](dev/05_WORKFLOW_DIARIO.md)
- Stack real del repo: [docs/STACK.md](STACK.md)

---

## Resumen rapido

Snapshot revisado el `2026-05-02`.

- El backend ya no es solo una idea: existe una base funcional con `Express 5`, `pg`, `bcrypt`, `jsonwebtoken`, `zod`, migraciones SQL propias y modulos de `auth` y `projects`.
- La base de datos ya tiene migraciones reales para `users`, `projects`, `sections`, `media_assets` y `project_preview_tokens`.
- El frontend usa `React 19 + TypeScript 6 + Vite 8`, pero todavia esta muy cerca del template inicial y no tiene rutas, cliente HTTP ni CMS implementado.
- `ESLint` esta configurado tanto en backend como en frontend.
- `lint` pasa en backend y frontend.
- `build` de frontend compila correctamente.

## Estado tecnico en una frase

La fundacion backend ya existe y el schema base ya esta definido; el mayor hueco actual esta en frontend, en el montaje real de admin/publico, en la proteccion efectiva de rutas admin y en los modulos de `sections`, `media`, `preview` y vistas publicas.