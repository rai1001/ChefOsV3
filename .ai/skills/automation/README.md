# ChefOS v3 Automation Skill

## Objetivo

`automation` es la skill interna del módulo `automation` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre automatizaciones, reglas de ejecución automática, disparadores, condiciones y orquestación controlada de acciones del sistema, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `automation`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `automation`
- diseñar o revisar contratos públicos del dominio de automatización
- ubicar correctamente lógica de automatización dentro de `src/features/automation/`
- separar automation de reporting, notifications, integrations o lógica fuente de otros módulos
- validar si una pieza del dominio de automatización afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `automation`
- revisar si una pieza legacy relacionada con automatizaciones merece migrarse al módulo

---

## Ownership del módulo

El módulo `automation` es owner de los concerns relacionados con ejecución automática y orquestación de reglas del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- reglas de automatización
- triggers o disparadores
- condiciones de ejecución
- acciones automáticas
- estados de automatización
- validaciones funcionales para automatizaciones
- coordinación de ejecución cuando la automatización actúa sobre contratos públicos de otros módulos

El módulo `automation` no es owner de:

- identidad, sesión o tenant actual
- lógica fuente de negocio de otros módulos
- reporting como salida analítica
- notifications como canal de comunicación
- integrations como conectividad externa
- commercial
- recipes
- catalog
- procurement
- inventory
- production
- compliance
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `automation`
- diseñar contratos públicos del dominio de automatización
- ubicar casos de uso de automatización dentro de la arquitectura oficial
- revisar si una solución mezcla `automation` con `reporting`, `notifications`, `integrations` o lógica interna de otros módulos
- validar impacto de tenancy y permisos en una automatización
- planificar trabajo pequeño y cerrado dentro de `automation`
- revisar si una pieza legacy de automatización debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver lógica fuente de negocio de otros módulos dentro de `automation`
- mezclar `automation` con notifications o integrations sin límites claros
- rediseñar la arquitectura global del sistema de eventos
- tocar módulos no relacionados por conveniencia
- usar `automation` como contenedor genérico de cualquier proceso complejo
- rehacer varios dominios a la vez
- duplicar lógica de negocio de otros módulos en lugar de consumir contratos públicos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `automation`.

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
2. validación de ownership dentro de `automation`
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
5. No meter lógica de `automation` en `src/app/`.
6. No meter lógica de `automation` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de automatización.
8. No duplicar lógica de otros módulos dentro de automation si existe contrato público.
9. No ignorar permisos, tenancy o límites funcionales cuando aplican.
10. No cerrar una propuesta sin contemplar validación suficiente según riesgo.

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

- ¿esta tarea pertenece realmente a `automation`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué triggers, condiciones o acciones automáticas toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `automation`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `automation`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `automation` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `automation`
- evita mezclar automatización con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para una regla automática
- decidir dónde vive una condición o trigger de automatización
- revisar si una validación pertenece al dominio de automation o a otro módulo
- ubicar acceso a datos de reglas automáticas dentro del módulo
- planificar una tarea cerrada del módulo `automation`

---

## Ejemplos de uso incorrectos

- mezclar automation con notifications, integrations y reporting en una sola tarea
- duplicar lógica fuente de otros módulos dentro de automation
- mover lógica de otros módulos al dominio de automatización por comodidad
- usar `automation` como módulo genérico de “cualquier proceso”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`automation` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `automation` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
