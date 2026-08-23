# Seguridad y reglas de implementación

Revisado el `2026-08-23`. El repositorio es público: todo lo que está aquí puede
leerlo cualquiera, y eso está considerado en las decisiones de abajo.

## Auth

### Lo que hay

- contraseña con `bcrypt`
- JWT firmado con `JWT_SECRET`, un día de vigencia, payload con solo `userId`
- `authMiddleware` aplicado en el montaje de todo lo que cuelga de `/admin`
- `is_active` se revisa en `login` **y** en `getMe`, así que desactivar una
  cuenta invalida sus tokens en la siguiente petición
- guards en el frontend: `ProtectedRoute` y `GuestRoute`
- `apiClient` emite `auth:unauthorized` ante un `401` y la sesión se cierra sola

### Decisiones conscientes, no descuidos

- **No hay refresh token.** El JWT dura un día y al vencer el siguiente `401`
  cierra la sesión. Aceptable para una sola administradora; si molesta, la
  solución es refresh token, no alargar la expiración
- **`logout` no invalida el JWT del lado del servidor.** Solo responde; el
  frontend limpia el token local
- **El token vive en `localStorage`**, así que un XSS podría leerlo. La
  alternativa segura sería cookie `httpOnly`, que implica refactorizar el
  backend y CORS con credenciales

### Pendientes de calidad

- el typo `"Inavlid token"` en `auth.middleware.js`
- `last_login_at` existe en la tabla y nunca se escribe

### Consecuencias de tener el repositorio público

La implementación de auth es visible para cualquiera, y está bien: la seguridad
no depende de esconder el código. Pero sí implica dos cosas:

- **la contraseña de producción tiene que ser larga y aleatoria**, porque
  cualquiera puede leer cómo funciona el login y que existe un seed
- **los secretos de producción no se reutilizan de desarrollo.** El `.env` local
  lleva meses en un disco; si se filtrara, con el mismo `JWT_SECRET` cualquiera
  podría firmar sesiones válidas

`docs/privado/` está en `.gitignore` y guarda material del cliente. Nada de su
contenido se copia a un archivo versionado ni se cita en el código.

## Estados de publicación

`unlisted` reemplazó a la preview por token. Un proyecto terminado tiene URL
permanente y no aparece en el feed.

Dos reglas lo sostienen, y las dos son fáciles de romper por accidente:

**La página de un `unlisted` lleva `noindex, nofollow`.** Sin eso Google indexa
las URLs que se compartieron en privado y el estado deja de significar nada.

**Un `draft` y un slug inexistente devuelven la misma respuesta.** Si se
distinguieran, cualquiera podría averiguar qué borradores existen probando URLs.

La preview por token se declaró muerta el `2026-08-23`. Ver
[02_DATOS_Y_API.md](02_DATOS_Y_API.md).

## Media

- los binarios no se guardan en PostgreSQL, solo su metadata
- el archivo no toca disco: va del buffer de memoria directo a R2
- la clave es `media/{uuid}.{ext}`, con la extensión derivada del **mime**, no
  del nombre que manda el cliente
- se sirve por `cdn.mitzuri.com`, no por el API
- `CacheControl: public, max-age=31536000, immutable`, porque la clave es única
  y el archivo nunca cambia

### Lo que sí conviene endurecer

El mime se valida contra `file.mimetype`, que **lo declara el cliente**. El
riesgo real es bajo —`image/svg+xml` está fuera de la lista, y R2 sirve el
archivo con el tipo que guardamos, así que un HTML disfrazado de PNG no se
ejecuta— pero no es una validación de verdad.

Ya se leen los bytes con `image-size` para sacar ancho y alto. Si esa lectura
falla, el archivo no es una imagen. Convertir eso en rechazo es una línea y da
validación real. Antes de hacerlo, comprobar que `image-size` lee AVIF, o se
rechazarían archivos válidos.

### Deuda aceptada por volumen

Subir una imagen y no guardar deja el archivo huérfano. Reemplazar una portada
no borra la anterior. Borrar un proyecto no borra sus archivos. Con este tamaño
de portafolio, limpiar a mano cuesta menos que automatizarlo.

## Reglas de trabajo técnico

- no editar migraciones ya aplicadas; cada cambio de schema es un archivo nuevo
- cerrar el contrato de API antes que la UI cuando ambos cambian
- no dar por funcional una ruta que no se probó
- los endpoints públicos declaran sus columnas, nunca `SELECT *`
- prohibido usar colores literales de Tailwind; solo tokens del `@theme`
- un valor que va a terminar dentro de un atributo `style` se valida en el
  schema **y** en la base

## Riesgos vigentes

- **`apiClient` devuelve vacío en silencio** cuando la respuesta no es JSON.
  Combinado con la reescritura de rutas de Vercel, convierte un error de
  configuración en una pantalla en blanco sin pistas. Ya pasó una vez
- **No hay tests.** Fue defendible mientras cada cambio pasaba por spec y
  auditoría de diff. Con contenido real cargado, deja de serlo
- **El backend duerme** en el plan gratuito de Render: la primera visita tras un
  rato de inactividad tarda entre 30 y 60 segundos
- **`JSONB` demasiado libre** volvería ambiguo el editor. Por eso hay un schema
  de Zod por tipo de bloque y se rechaza cualquier `type` desconocido
