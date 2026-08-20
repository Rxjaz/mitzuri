# CLAUDE.md

Instrucciones para Claude Code al trabajar en este repositorio.

## Qué es Mitzuri

Portafolio de una diseñadora, con dos caras: un sitio público que muestra
proyectos y un CMS privado donde ella los crea y publica.

**Hay una sola usuaria administradora.** No hay registro público, no hay roles,
no hay área de usuario para visitantes. Nunca propongas features multi-usuario.

El portafolio tendrá ~10 proyectos, de los cuales ~5 públicos. El resto vive en
privado y se comparte por URL de preview. Diseña para ese volumen: nada de
paginación, búsqueda, filtros o infinite scroll.

## Comandos

```bash
npm run dev            # backend + frontend en paralelo
npm run db:migrate     # aplica migraciones pendientes
npm run db:seed        # crea/actualiza el admin local

npm run lint --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend   # tsc -b && vite build
```

PostgreSQL corre en Docker: `docker compose up -d`.

Antes de dar por terminado cualquier cambio: lint del paquete tocado, y build
del frontend si tocaste frontend.

## Arquitectura

Monorepo con `backend/`, `frontend/` y `docs/`. No hay workspaces de npm; cada
paquete instala aparte y la raíz orquesta con `--prefix`.

### Backend — Node ESM, Express 5

Cadena de responsabilidades, sin saltarse eslabones:

```
routes → controller → service → repository → db
```

- **routes** — define endpoints y encadena middleware (`validate`, `auth`). Nada más.
- **controller** — lee la request, responde, y `next(error)` en el catch. **Cero lógica de negocio.**
- **service** — todas las reglas de negocio. Lanza errores de dominio.
- **repository** — SQL con `pool.query`. Único lugar que habla con la base.

Un controller nunca importa el repository. Un repository nunca lanza errores de
dominio ni conoce reglas.

Detalles que ya son convención en el repo:

- ESM con extensión explícita en los imports: `import ... from "./x.service.js"`
- Los módulos exportan funciones sueltas (`export const create = ...`), no clases
- El controller importa el service con namespace: `import * as projectsService from ...`
- SQL crudo con `pg` y parámetros posicionales `$1, $2`. Nunca interpolar strings.
- Errores: clases que extienden `AppError` en `shared/errors/`, con `export default`
- Validación: `validate(schema)` de `shared/middleware/`. Zod 4 — los problemas
  están en `error.issues`, **no** en `error.errors`
- `errorMiddleware` necesita los 4 parámetros `(err, req, res, next)` o Express
  no lo reconoce como manejador de error

### Frontend — React 19 + TypeScript + Vite

```
src/
├── app/admin/     # panel privado: auth, layout, pages, routes
├── app/public/    # sitio público
├── components/ui/ # componentes compartidos
├── services/      # apiClient + un servicio por feature
└── types/         # tipos compartidos
```

- Todo HTTP pasa por `services/apiClient.ts`. Nunca `fetch` directo en un componente.
- `apiClient` lanza `ApiError` con `status`, y emite `auth:unauthorized` en 401.
- Un servicio por feature (`projects.service.ts`), funciones sueltas tipadas,
  con `BASE_PATH` como constante arriba.
- Los tipos compartidos viven en `src/types/`, no dentro de los componentes.
- Componentes UI: `export default`, props con `type` (no `interface`), y
  variantes como `Record<Variant, string>` de clases completas.
- Tailwind 4. `cn` de `lib/cn.ts` **solo concatena**, no resuelve conflictos de
  Tailwind — cada variante trae su set completo de clases.
- **Prohibido usar colores literales de Tailwind** (`stone-900`, `blue-600`,
  `gray-100`…). Solo tokens del `@theme` de `index.css`: `ink`, `ink-muted`,
  `paper`, `surface`, `border`, `brand`, `brand-strong`, `brand-soft`,
  `danger`. Si un color que necesitas no existe como token, **pregunta** — no
  lo inventes.
- Tipografía: `font-display` (Yeseva One) **solo en el sitio público y solo a
  24px o más**; no tiene bold ni itálica, así que la jerarquía se hace con
  tamaño y espaciado. Todo lo demás en `font-sans` (Be Vietnam Pro). El admin
  nunca carga la display.
- El token vive en `localStorage`, aislado en `services/token.storage.ts`.

### Base de datos

Migraciones numeradas en `backend/sql/` (`001_`, `002_`, …). El runner registra
cada una en `schema_migrations` con checksum.

**Nunca edites una migración ya aplicada** — el checksum falla. Para cambiar
algo, crea el siguiente archivo numerado.

Tablas: `users`, `projects`, `sections`, `media_assets`, `project_preview_tokens`.

## Estilo de código

- Comentarios **en español, en minúsculas**, y explican el **porqué**, no el qué.
  Si el código ya se lee solo, no lo comentes.
- Comillas dobles, punto y coma.
- No agregues dependencias sin que Ariel lo apruebe explícitamente.
- Los finales de línea los normaliza `.gitattributes` a LF. No los toques.

## Decisiones ya tomadas — no las revisites

- El `slug` siempre lo deriva el backend desde el título, nunca lo manda el
  cliente. En `draft` sigue al título; al publicar **se congela**, para no
  romper una URL ya compartida.
- No hay refresh token. El JWT dura 1 día y al vencer el siguiente 401 cierra
  la sesión. Es aceptable para una sola admin.
- `POST /auth/logout` no invalida el JWT del lado del servidor; el frontend
  limpia el token local.
- El token en `localStorage` es una decisión consciente, no un descuido.

## Cómo trabajar aquí

1. **Una tarea a la vez.** No abras módulos en paralelo.
2. **Backend antes que frontend.** Cierra el contrato de API primero; el
   frontend se construye contra un contrato que ya existe.
3. Si la tarea toca el schema, la migración va primero.
4. Al terminar, corre lint (y build si tocaste frontend).
5. **No actualices `docs/` por tu cuenta.** Esos documentos los mantiene el
   equipo cuando el comportamiento ya existe de verdad.

## Alcance — qué NO hacer sin permiso

- No refactorices código que no es parte de la tarea pedida.
- No cambies configuración compartida (`vite.config.ts`, `eslint.config.js`,
  `docker-compose.yml`, `package.json`) sin decirlo antes.
- No toques `.env`.
- No hagas commits ni cambies de rama.
- `docs/privado/` guarda material del cliente —portafolios, archivos con datos
  personales— y está en `.gitignore`. Puedes leer de ahí si Ariel te lo pide,
  pero **nunca** copies su contenido a un archivo versionado ni lo cites en el
  código. El repositorio es público.
- Si la spec es ambigua, **pregunta antes de decidir**. Una decisión de producto
  tomada en silencio cuesta más que una pregunta.

## Documentación de referencia

`docs/` no es opcional, es la fuente de verdad del producto:

| Documento | Cuándo abrirlo |
| --- | --- |
| `docs/dev/00_ESTADO_ACTUAL.md` | Qué existe hoy de verdad |
| `docs/dev/04_FASES.md` | Prioridad y orden del trabajo |
| `docs/dev/02_DATOS_Y_API.md` | Antes de tocar schema o endpoints |
| `docs/dev/01_ARQUITECTURA.md` | Antes de tocar carpetas o capas |
| `docs/producto/01_ALCANCE_V1.md` | Qué entra y qué no en la v1 |
| `docs/producto/05_IDENTIDAD_Y_FEED.md` | Decisiones abiertas del feed público |

## Estado actual

Cerrado: auth admin con sesión persistente, guards de rutas, CRUD de proyectos
con publish/unpublish, migraciones y seed.

Siguiente: **subida de portada** (primer corte del módulo media). Después:
resto de media, secciones, preview privada, sitio público.

No hay tests todavía. Si agregas comportamiento con reglas no triviales,
propón el test — no lo des por hecho.
