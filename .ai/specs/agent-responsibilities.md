# ChefOS v3 Agent Responsibilities

## Objetivo

Este documento define cómo debe comportarse un agente (AI o humano asistido por AI) cuando opera sobre ChefOS v3.

Su propósito es evitar:

- trabajo disperso sin ownership claro
- tareas cerradas sin estado verde
- improvisación ante ambigüedad
- pérdida de trazabilidad de decisiones
- atajos que rompan reglas duras

Este documento es normativo.

---

## Principios

1. El agente ejecuta tareas dentro de un alcance cerrado.
2. El agente no improvisa arquitectura.
3. El agente no cierra tareas en estado rojo.
4. El agente registra ambigüedades como decisiones explícitas.
5. El agente sigue la secuencia oficial de WORKFLOW.md paso a paso.
6. El agente respeta los contratos y migraciones como fuente de verdad.
7. El agente trata multi-tenant y RLS como reglas duras no negociables.
8. El agente no salta checklists ni definition of done.

---

## Forma de trabajo

### Orden de ejecución

- Las tareas se ejecutan en el orden marcado por el sprint activo.
- Dentro de un sprint, las tareas de fundación preceden a las de módulo.
- No se comienza una tarea si la anterior no cerró en estado verde.

### Definición de "verde"

Una tarea queda verde cuando:

- `npm run lint` pasa
- `npm run typecheck` pasa
- `npm run test` pasa
- `npm run build` pasa
- los tests específicos del cambio pasan
- la documentación requerida ha sido actualizada
- el cambio cumple `specs/definition-of-done.md`

Si alguno de los checks falla, la tarea sigue abierta hasta que se repare.

---

## En caso de ambigüedad

El agente NO debe improvisar.

Ante ambigüedad:

1. Buscar respuesta en `.ai/specs/`, `.ai/sprints/`, `docs/`.
2. Si la respuesta no está, registrar la decisión en `specs/decisions-log.md`.
3. Elegir la opción más simple y coherente con el stack oficial.
4. Dejar la decisión documentada con fecha, contexto y alternativas consideradas.

Está prohibido tomar una decisión estructural y dejarla solo en el código.

---

## Reglas de oro

### Contratos y migraciones mandan

- Los contratos públicos de cada módulo (expuestos via `src/features/<module>/index.ts`) son la fuente de verdad para el consumo entre módulos.
- Las migraciones en `supabase/migrations/` son la fuente de verdad para el schema.
- Nunca se implementa un módulo contra un contrato inventado. Si el contrato no existe, se define primero y luego se implementa.

### Multi-tenant por `hotel_id`

- Toda tabla de negocio lleva `hotel_id uuid not null`.
- Toda query filtra por `hotel_id`.
- Toda RPC valida membership vía `check_membership()`.

### RLS activo siempre

- RLS habilitado en todas las tablas sensibles.
- Credentials y payloads sensibles solo accesibles vía RPC SECURITY DEFINER con role check (ver `specs/database-security.md`).

### UI sigue el design system

- Tokens, fuentes, colores y patrones definidos en `specs/design-tokens.md`.
- No se introducen tokens nuevos sin decisión explícita en `decisions-log.md`.

---

## Cuándo el agente para

El agente interrumpe ejecución y pide clarificación al usuario cuando:

- el alcance de la tarea no está claro
- existe contradicción entre dos specs de `.ai/`
- una decisión afecta arquitectura, ownership o contrato público
- el cambio requerido implicaría romper una regla dura
- no existe contrato definido para lo que se pide
- no existe migración que soporte el cambio de datos necesario

Parar y preguntar es preferible a improvisar.

---

## Cuándo el agente continúa sin preguntar

El agente puede continuar sin preguntar cuando:

- la tarea está claramente definida en el sprint activo
- la decisión técnica es trivial y reversible
- la elección está cubierta por una spec normativa
- el cambio no afecta ownership, contrato público ni reglas duras

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/specs/task-execution-order.md`
- `/.ai/specs/core-constraints.md`
- `/.ai/specs/decisions-log.md`

---

## Estado de esta especificación

Este documento define las responsabilidades operativas del agente en ChefOS v3.

Todo agente que opere sobre el proyecto debe poder validar su trabajo contra estas reglas.
