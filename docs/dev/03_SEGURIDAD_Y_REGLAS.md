# Seguridad y reglas de implementacion

## Auth

### Estado actual

- password hasheado con `bcrypt`
- JWT firmado con `JWT_SECRET`
- `authMiddleware` activo
- `/auth/logout` y `/auth/me` protegidos
- `/admin/projects` protegido desde el montaje principal

### Huecos actuales

- `logout` no invalida JWT ni mantiene lista de revocacion
- el payload JWT solo guarda `userId`
- no hay refresh tokens
- no existe guard frontend para impedir entrar a `/admin` sin sesion valida
- el token vive en `localStorage`, suficiente para una base admin simple, pero no para un modelo mas endurecido

## Preview privada

Base ya preparada:

- tabla `project_preview_tokens`

Pendiente:

- generacion real de token
- invalidacion
- expiracion util
- endpoint publico por token
- no indexacion

## Media

Base ya preparada:

- tabla `media_assets`
- cliente R2 en [backend/src/shared/storage/r2Client.js](../../backend/src/shared/storage/r2Client.js)

Reglas que se mantienen:

- no guardar binarios en PostgreSQL
- guardar metadata en DB
- preferir original + derivados optimizados
- decidir naming y estrategia de borrado antes de abrir uploads reales

## Reglas de trabajo tecnico

- no editar migraciones ya aplicadas en una base real
- cada cambio de schema debe entrar como archivo nuevo en `backend/sql/`
- no asumir una ruta funcional si no fue probada
- cerrar primero contrato y datos antes de cerrar UI cuando ambos cambian
- no avanzar a polish visual si CRUD, auth y narrativa no estan resueltos
- no abrir Tailwind como tarea aislada; usarlo como base del admin real

## Riesgos tecnicos principales

- `JSONB` demasiado libre puede volver ambiguo el editor
- preview privada mal protegida puede exponer borradores
- introducir muchas pantallas antes de cerrar guardas y sesion puede duplicar deuda
- iniciar media sin pipeline claro puede dejar URLs sueltas y deuda tecnica
- mantener estilos del starter de Vite mientras crece la UI solo agrega retrabajo

## Reglas de comportamiento que siguen vigentes

### Publicacion

- solo `published` aparece en publico
- un `draft` nunca aparece publicamente
- publicar debe fijar `published_at`
- despublicar debe regresar a `draft`

### Orden de secciones

- cada seccion debe tener `position`
- la posicion debe ser unica dentro del proyecto
- el reordenamiento debe ser estable

### Eliminacion

- eliminar proyecto debe arrastrar secciones y preview tokens
- la estrategia de borrado de media aun debe decidirse de forma explicita
