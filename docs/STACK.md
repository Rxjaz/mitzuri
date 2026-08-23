# MITZURI - Stack real del proyecto

Documento basado en inspeccion real del repo el `2026-08-23`.

## Vista general

`Mitzuri` es un monorepo pequeno, en produccion, con:

- backend en `JavaScript ESM` sobre `Node.js`
- frontend en `React + TypeScript` con `Vite`
- ruteo frontend con `react-router-dom`
- base de datos `PostgreSQL`, local por Docker y en la nube por Neon
- media en `Cloudflare R2`
- orquestacion local con `Docker Compose`
- scripts de desarrollo en el `package.json` raiz

No hay workspaces de npm: cada paquete instala aparte y la raiz orquesta con
`--prefix`.

---

## Stack por capa

### Raiz del repo

Lenguajes y archivos base:

- `package.json` raiz con scripts de orquestacion
- `.env` unico en la raiz como convencion actual
- `docker-compose.yml` para Postgres local

Dependencias detectadas:

- `concurrently`: levanta backend y frontend al mismo tiempo

Scripts detectados:

- `npm run dev`: ejecuta backend y frontend en paralelo
- `npm run db:migrate`: delega a `backend/scripts/migrate.js`
- `npm run db:seed`: delega a `backend/scripts/seed-dev.js`

### Backend

Lenguaje y runtime:

- `JavaScript` moderno con modulos `ESM`
- `type: module` en `backend/package.json`
- runtime local de `Node.js`
- `Dockerfile` basado en `node:22`

Framework principal:

- `Express 5.2.1`

Base de datos:

- `pg 8.20.0`
- conexion por `DATABASE_URL` o por variables discretas `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Auth y seguridad:

- `bcrypt 6.0.0` para hash de password
- `jsonwebtoken 9.0.3` para tokens JWT

Validacion:

- `zod 4.4.1`

Storage:

- `@aws-sdk/client-s3 3.1035.0`
- cliente S3 configurado para `Cloudflare R2`
- `multer 2.2.0` para recibir `multipart/form-data`, con `memoryStorage`: el
  archivo va del buffer directo a R2 y nunca toca disco
- `image-size 2.0.2` para leer ancho y alto del buffer; JavaScript puro, sin
  binarios nativos
- el bucket se sirve por dominio propio, declarado en `R2_PUBLIC_BASE_URL`

Entorno:

- `dotenv 17.4.2`

Tooling:

- `nodemon 3.1.14`
- `eslint 10.3.0`
- `@eslint/js 10.0.1`
- `globals 17.6.0`

### Frontend

Lenguajes y runtime:

- `TypeScript 6.0.2`
- `React 19.2.4`
- `React DOM 19.2.4`
- `react-router-dom 7.15.0`

Build y desarrollo:

- `Vite 8.0.4`
- `@vitejs/plugin-react 6.0.1`

Lint y tipos:

- `eslint 9.39.4`
- `@eslint/js 9.39.4`
- `typescript-eslint 8.59.1`
- `eslint-plugin-react 7.37.5`
- `eslint-plugin-react-hooks 7.1.1`
- `eslint-plugin-react-refresh 0.5.2`
- `@types/react`, `@types/react-dom`, `@types/node`

Estilos:

- `Tailwind CSS 4.3.0` con `@tailwindcss/vite`
- tokens de color y tipografia en el bloque `@theme` de `src/index.css`;
  **no se usan colores literales de Tailwind en ningun lado**
- capa de componentes en `src/styles/components.css`
- `cn` en `src/lib/cn.ts` solo concatena, no resuelve conflictos de Tailwind
- sin CSS Modules, sin libreria UI

Tipografias, self-hosted:

- `@fontsource/yeseva-one 5.3.0` — display, un solo peso, solo sitio publico
- `@fontsource/be-vietnam-pro 5.3.0` — texto, pesos 400, 500 y 700

### Base de datos

Motor detectado:

- `PostgreSQL 18` en `docker-compose.yml` para local
- `PostgreSQL 18` en Neon para produccion

Las dos versiones coinciden a proposito. Desde la 18, la imagen oficial de
Docker monta el volumen en `/var/lib/postgresql` y no en `/data`.

Schema gestionado por once migraciones SQL versionadas, de `001` a `011`.
El detalle de cada una esta en [dev/02_DATOS_Y_API.md](dev/02_DATOS_Y_API.md).

---

## Configuracion de calidad

### Backend ESLint

Archivo:

- [backend/eslint.config.js](../backend/eslint.config.js)

### Frontend ESLint

Archivo:

- [frontend/eslint.config.js](../frontend/eslint.config.js)

Incluye:

- base de `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react`
- `react-hooks`
- `react-refresh`

### Estado actual de calidad

Verificado el `2026-08-23`:

- `npm run lint --prefix backend`: pasa
- `npm run lint --prefix frontend`: pasa
- `npm run build --prefix frontend`: pasa
- `grep -rE "stone-|slate-|gray-|zinc-" frontend/src`: sin resultados

No existe:

- `Prettier`
- framework de tests
- `husky`
- `lint-staged`
- CI

**La ausencia de tests es la deuda tecnica principal del proyecto.** Fue una
decision consciente mientras cada cambio pasaba por una spec con criterios de
aceptacion y una auditoria del diff. Con contenido real cargado, deja de serlo.

---

## Variables de entorno detectadas

Variables usadas hoy en el codigo:

- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `DATABASE_URL`
- `DB_SSL`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FULL_NAME`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ACCESS_KEY_ID`
- `CLOUDFLARE_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

En `docker-compose.yml`:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

En el frontend, con prefijo obligatorio `VITE_`:

- `VITE_API_BASE_URL`

Notas importantes:

- **`FRONTEND_URL` admite varios origenes separados por comas.** En produccion
  lleva el dominio con y sin `www`; si falta el que usa el navegador, CORS
  bloquea todo sin dejar rastro en el servidor
- **Todo lo que lleva prefijo `VITE_` es publico.** Vite lo incrusta en el
  JavaScript que descarga cada visitante, y se lee al **construir**, no al
  ejecutar: cambiarlo obliga a volver a desplegar. Ahi nunca va un secreto
- **`PREVIEW_TOKEN_SECRET` esta declarado y nunca se usa.** La preview por token
  se cancelo; ver [dev/04_FASES.md](dev/04_FASES.md)

---

## Decisiones de stack, ya cerradas

- backend en `JavaScript` con ESM, no en `TypeScript`
- frontend en `TypeScript`
- `Express` en lugar de `Fastify` o `Nest`
- `pg` y SQL manual en lugar de `Prisma`, `Drizzle` o `TypeORM`
- `Zod` como validador, en el backend
- JWT en `localStorage` para la sesion admin, sin refresh token
- `Cloudflare R2` para media, con subida a traves del backend
- `React Router` para navegacion
- `Tailwind 4` con tokens propios en `@theme`, sin libreria de componentes
- tipografias self-hosted con `@fontsource`

## Infraestructura de produccion

| Pieza | Servicio | Plan |
| --- | --- | --- |
| Frontend | Vercel | Hobby |
| API | Render, region Ohio | gratuito |
| Base de datos | Neon, region Ohio | gratuito |
| Imagenes | Cloudflare R2 | — |

Render y Neon comparten region a proposito: cada carga de pagina son varias
consultas del backend a la base.

Dos limitaciones de los planes gratuitos, documentadas en
[dev/00_ESTADO_ACTUAL.md](dev/00_ESTADO_ACTUAL.md):

- el servicio de Render **duerme** tras 15 minutos sin trafico
- el plan Hobby de Vercel es **solo para uso no comercial**

## Lo que el stack sugiere y no esta montado

- tests
- CI
- derivados optimizados de imagen
- Open Graph
- observabilidad mas alla de `/health`
