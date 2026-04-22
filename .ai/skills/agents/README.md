# ChefOS v3 Agents Skill

## Objetivo

`agents` es la skill interna del módulo `agents` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre agentes, asistentes operativos, ejecuciones guiadas, contextos de asistencia y flujos con intervención humana, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `agents`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `agents`
- diseñar o revisar contratos públicos del dominio de agentes
- ubicar correctamente lógica de agentes dentro de `src/features/agents/`
- separar agents de automation, integrations, identity o lógica fuente de otros módulos
- validar si una pieza del dominio de agentes afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `agents`
- revisar si una pieza legacy relacionada con agentes merece migrarse al módulo

---

## Ownership del módulo

El módulo `agents` es owner de los concerns relacionados con asistencia operativa guiada dentro del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- definiciones de agentes
- contexto operativo de agentes
- configuraciones de asistencia
- sesiones o ejecuciones asistidas
- restricciones funcionales de agentes
- trazabilidad de ejecución de agentes
- validaciones necesarias para asegurar que los agentes operan dentro de límites explícitos
- puntos de intervención humana dentro de flujos asistidos

Regla crítica:

Los agentes en ChefOS v3 son asistidos, no autónomos.

El módulo `agents` no es owner de:

- automatizaciones genéricas del sistema
- integraciones externas como dominio propio
- identidad, sesión o tenant actual
- lógica fuente de negocio de otros módulos
- notifications como canal de salida
- reporting como salida analítica
- commercial
- recipes
- catalog
- procurement
- inventory
- production
- compliance
- hr
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `agents`
- diseñar contratos públicos del dominio de agentes
- ubicar casos de uso de asistencia operativa dentro de la arquitectura oficial
- revisar si una solución mezcla `agents` con `automation`, `integrations`, `identity` o lógica interna de otros módulos
- validar impacto de tenancy y permisos en una ejecución asistida
- planificar trabajo pequeño y cerrado dentro de `agents`
- revisar si una pieza legacy de agentes debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver automatizaciones genéricas dentro de `agents`
- convertir agentes en ejecutores autónomos sin control humano
- mezclar `agents` con integrations o automation sin límites claros
- rediseñar toda la estrategia de producto alrededor de AI en una sola tarea
- tocar módulos no relacionados por conveniencia
- usar `agents` como contenedor genérico de cualquier lógica compleja
- rehacer varios dominios a la vez
- duplicar lógica de negocio de otros módulos en lugar de consumir contratos públicos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `agents`.

Como mínimo, debe recibir:

- tarea exacta
- objetivo concreto
- alcance permitido
- fuera de alcance
- impacto esperado en datos
- impacto esperado en permisos
- impacto esperado en multi-tenant
- si afecta contrato público o no
- si existe legacy implicado o no

---

## Salidas esperadas

La salida de esta skill debe producir, como mínimo:

1. resumen operativo de la tarea
2. validación de ownership dentro de `agents`
3. encaje arquitectónico del cambio
4. contrato público afectado o nuevo
5. archivos o carpetas a crear o modificar
6. restricciones de permisos y tenancy
7. tests requeridos
8. riesgos y bloqueos

La salida debe ser concreta y verificable.

---

## Reglas obligatorias

1. No inventar arquitectura nueva.
2. No rehacer el stack.
3. No mezclar varias tareas en una sola ejecución.
4. No invadir ownership de otros módulos.
5. No meter lógica de `agents` en `src/app/`.
6. No meter lógica de `agents` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de agentes.
8. No duplicar lógica de otros módulos dentro de `agents` si existe contrato público.
9. No ignorar permisos, tenancy o límites funcionales cuando aplican.
10. No cerrar una propuesta sin contemplar validación suficiente según riesgo.
11. No diseñar agentes autónomos fuera de control humano.
12. Toda propuesta del módulo debe respetar la regla de agentes asistidos, no autónomos.

---

## Documentos base que debe respetar

Esta skill debe operar alineada con:

- `.ai/README.md`
- `.ai/WORKFLOW.md`
- `.ai/specs/architecture.md`
- `.ai/specs/coding-standards.md`
- `.ai/specs/testing-standards.md`
- `.ai/specs/migration-policy.md`
- `.ai/specs/definition-of-done.md`
- `.ai/specs/module-template.md`

---

## Preguntas que esta skill debe ayudar a responder

Antes de proponer una solución, esta skill debe poder responder:

- ¿esta tarea pertenece realmente a `agents`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué configuraciones, sesiones o ejecuciones asistidas toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `agents`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿cómo se garantiza intervención o control humano cuando aplica?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `agents`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `agents` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `agents`
- evita mezclar agentes con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- respeta el principio de agentes asistidos y no autónomos
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para configurar un agente asistido
- decidir dónde vive una restricción de ejecución o intervención humana
- revisar si una validación pertenece al dominio de `agents` o a otro módulo
- ubicar acceso a datos de sesiones o ejecuciones asistidas dentro del módulo
- planificar una tarea cerrada del módulo `agents`

---

## Ejemplos de uso incorrectos

- mezclar agents con automation, integrations y notifications en una sola tarea
- duplicar lógica fuente de otros módulos dentro de `agents`
- mover lógica de otros módulos al dominio de agentes por comodidad
- usar `agents` como módulo genérico de “todo lo inteligente”
- diseñar agentes autónomos sin límites ni supervisión
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`agents` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `agents` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos, arquitectura oficial y la regla de agentes asistidos.
