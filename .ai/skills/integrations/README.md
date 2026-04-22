# ChefOS v3 Integrations Skill

## Objetivo

`integrations` es la skill interna del módulo `integrations` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre conectividad externa, adapters, sincronización con sistemas terceros, contratos de integración y fronteras técnicas hacia servicios externos, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `integrations`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `integrations`
- diseñar o revisar contratos públicos del dominio de integraciones
- ubicar correctamente lógica de integración dentro de `src/features/integrations/`
- separar integrations de automation, notifications o lógica fuente de otros módulos
- validar si una pieza del dominio de integraciones afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `integrations`
- revisar si una pieza legacy relacionada con integraciones merece migrarse al módulo

---

## Ownership del módulo

El módulo `integrations` es owner de los concerns relacionados con la conexión controlada entre ChefOS v3 y sistemas externos.

Según el alcance concreto del proyecto, esto puede incluir:

- adapters hacia servicios terceros
- contratos de entrada y salida con sistemas externos
- sincronizaciones controladas
- mapeos entre modelos internos y externos
- validaciones funcionales de integración
- manejo de estados de integración
- puntos de extensión para conectividad externa dentro del sistema

El módulo `integrations` no es owner de:

- identidad, sesión o tenant actual
- lógica fuente de negocio de otros módulos
- automation como orquestación automática
- notifications como canal de comunicación
- reporting como salida analítica
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

- definir el alcance exacto del módulo `integrations`
- diseñar contratos públicos del dominio de integraciones
- ubicar casos de uso de conectividad externa dentro de la arquitectura oficial
- revisar si una solución mezcla `integrations` con `automation`, `notifications` o lógica interna de otros módulos
- validar impacto de tenancy y permisos en una integración
- planificar trabajo pequeño y cerrado dentro de `integrations`
- revisar si una pieza legacy de integraciones debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver lógica fuente de negocio de otros módulos dentro de `integrations`
- mezclar `integrations` con automation o notifications sin límites claros
- rediseñar toda la arquitectura de eventos o comunicaciones del sistema
- tocar módulos no relacionados por conveniencia
- usar `integrations` como contenedor genérico de cualquier proceso técnico
- rehacer varios dominios a la vez
- duplicar lógica de negocio de otros módulos en lugar de consumir contratos públicos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `integrations`.

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
2. validación de ownership dentro de `integrations`
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
5. No meter lógica de `integrations` en `src/app/`.
6. No meter lógica de `integrations` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de integraciones.
8. No duplicar lógica de otros módulos dentro de integrations si existe contrato público.
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

- ¿esta tarea pertenece realmente a `integrations`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué sistemas externos, adapters o sincronizaciones toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `integrations`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `integrations`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `integrations` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `integrations`
- evita mezclar integraciones con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para sincronizar con un sistema externo
- decidir dónde vive un adapter o mapper de integración
- revisar si una validación pertenece al dominio de integrations o a otro módulo
- ubicar acceso a servicios externos dentro del módulo
- planificar una tarea cerrada del módulo `integrations`

---

## Ejemplos de uso incorrectos

- mezclar integrations con automation, notifications y reporting en una sola tarea
- duplicar lógica fuente de otros módulos dentro de integrations
- mover lógica de otros módulos al dominio de integraciones por comodidad
- usar `integrations` como módulo genérico de “cualquier proceso técnico”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`integrations` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `integrations` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
