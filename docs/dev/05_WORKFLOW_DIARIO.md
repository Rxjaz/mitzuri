# Workflow diario

## Orden recomendado para trabajar

1. Elegir una sola tarea activa.
2. Revisar [docs/dev/04_FASES.md](04_FASES.md) para no mezclar prioridades.
3. Si la tarea toca schema, crear una migracion nueva en `backend/sql/`.
4. Levantar PostgreSQL local.
5. Ejecutar migraciones.
6. Si hace falta admin local, correr el seed.
7. Cerrar backend primero cuando el contrato todavia no existe.
8. Cerrar frontend despues de cerrar contrato y respuesta esperada.
9. Verificar `lint` y, si aplica, `build`.
10. Actualizar docs cuando el comportamiento exista de verdad.

## Comandos base

```bash
docker compose up -d db
npm run db:migrate
npm run db:seed
npm run dev
```

## Verificaciones utiles

```bash
npm run lint --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
```

## Regla central de prioridad

Con el repo como esta hoy, la prioridad ya no debe ser abrir nuevos modulos paralelos. La prioridad debe ser cerrar un slice vertical chico y util:

1. auth admin confiable
2. shell admin
3. listado de proyectos
4. formulario base de proyecto
5. estilo base reutilizable

Si una tarea no empuja uno de esos cinco puntos, probablemente no sea lo mas estrategico ahorita.

## Orden recomendado de lo siguiente

1. Endurecer el flujo admin actual.
2. Instalar Tailwind y definir la base visual del admin.
3. Conectar `projects` al frontend.
4. Cerrar alta, listado y edicion minima de proyectos.
5. Pasar a `media`.
6. Pasar a `sections`.
7. Implementar preview privada.
8. Construir sitio publico final.

## Por que Tailwind entra aqui y no despues

Hoy el frontend todavia tiene muy poca superficie real:

- una `LoginPage`
- un placeholder para `/admin`
- servicios base

Eso vuelve barato el cambio de estrategia visual. Meter Tailwind despues de haber construido dashboard, tabla, formularios y editor costaria mas. Meterlo ahora permite construir componentes reutilizables una sola vez.

## Cuando abrir cada documento

- Si vas a cambiar schema o endpoints: [docs/dev/02_DATOS_Y_API.md](02_DATOS_Y_API.md)
- Si vas a tocar arquitectura o carpetas: [docs/dev/01_ARQUITECTURA.md](01_ARQUITECTURA.md)
- Si vas a priorizar trabajo: [docs/dev/04_FASES.md](04_FASES.md)
- Si vas a revisar stack o dependencias: [docs/STACK.md](../STACK.md)
- Si vas a decidir la estrategia visual y Tailwind: [docs/dev/06_FRONTEND_Y_TAILWIND.md](06_FRONTEND_Y_TAILWIND.md)
