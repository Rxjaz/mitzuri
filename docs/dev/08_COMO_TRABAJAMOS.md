# Cómo trabajamos

Documento de método, no de producto. Explica los roles y el ciclo de trabajo
que se sigue en este repositorio. Si abres una sesión nueva con un asistente,
esto es lo que necesita leer para retomar sin contexto previo.

## Los tres roles

**Ariel** decide. Es quien manda: nada se ejecuta sin su consentimiento. Corre
los comandos de git, prueba en el navegador y configura los paneles externos.

**El asistente estratégico** —Claude en modo CEO— escribe las specs, audita los
diffs, mantiene `docs/` y discute producto. **Su trabajo incluye contradecir a
Ariel.** Si una decisión parece equivocada, lo dice y explica por qué. Estar de
acuerdo por comodidad no ayuda a nadie.

**Claude Code** implementa. Solo ejecuta specs. No decide producto, no toca
`docs/`, no commitea, no cambia de rama.

## El ciclo, por tarea

1. Ariel dice el objetivo en lenguaje de producto, no técnico
2. El asistente escribe `docs/specs/NN_nombre.md` y Ariel la aprueba o corrige
3. Ariel se la pasa a Claude Code, **en un chat nuevo por spec**
4. Ariel avisa que terminó
5. El asistente audita: lee el diff, corre lint y `tsc`, contrasta contra la
   spec y contra `CLAUDE.md`
6. Ariel prueba lo que solo él puede probar: navegador, base de datos, paneles
7. Ariel commitea con el mensaje que le pasa el asistente
8. El asistente actualiza `00_ESTADO_ACTUAL.md`

El paso 2 es donde está casi todo el valor. Los desastres con un agente de
código casi nunca vienen de que escriba mal, sino de instrucciones sin
criterios de aceptación: si no se define cómo se ve "terminado", el agente lo
decide, y lo decide distinto cada vez.

## El prompt para Claude Code

Siempre el mismo, apuntando al archivo y no pegando su contenido:

```
Lee docs/specs/NN_nombre.md y ejecútala completa.
No hagas nada fuera de esa spec. No commitees, no cambies de rama, y no toques docs/.
Al terminar corre lint de backend y frontend, y build de frontend.
Si algo te parece ambiguo o mal, para y pregunta.
```

Pasar la ruta y no el texto tiene tres ventajas: no se trunca, la spec queda
versionada, y la auditoría se hace contra el mismo documento que él leyó.

**Chat nuevo por spec, mismo chat para correcciones de esa spec.** Nunca abrir
un chat nuevo a media tarea.

## Cómo se escribe una spec

Las ocho de `docs/specs/` sirven de plantilla. Lo que no puede faltar:

- **Objetivo** en términos de producto, y por qué ahora
- **El problema real**, incluido el bug o la deuda que se está pagando
- **Migración completa**, escrita, si toca el schema
- **Cambios archivo por archivo**, con el porqué de cada decisión no obvia
- **Criterios de aceptación** verificables a mano, no aspiraciones
- **Fuera de alcance**, explícito. Es lo que evita que la tarea crezca
- **Lo que queda anotado para después**, con la razón de haberlo pospuesto

Cuando una spec pide algo raro —una restricción diferible, un formato de color
validado en dos capas— hay que decir **por qué** y prohibir explícitamente que
el agente invente otra solución. Si no, improvisa.

## Reglas de git

- Un commit por tarea, al cerrarla, antes de empezar la siguiente
- **Nunca `git add .` cuando se quieren commits separados.** Rutas explícitas
- La spec se commitea **antes** que su implementación
- Pushear seguido: el trabajo que solo vive en un disco no existe
- Reescribir historia ya pusheada solo con `--force-with-lease`, y solo mientras
  se trabaje en solitario

## Qué solo puede hacer Ariel

El asistente lee el repo, corre lint y `tsc`, y audita. No puede:

- correr migraciones contra la base, ni local ni de producción
- ver el sitio en un navegador
- entrar a Render, Vercel, Neon o Cloudflare
- hacer commits

Cuando una tarea depende de algo de esa lista, la spec lo separa en una parte
manual, como hace `08_deploy.md`.
