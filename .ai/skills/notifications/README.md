# ChefOS v3 Notifications Skill

## Objetivo

`notifications` es la skill interna del módulo `notifications` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre notificaciones, entregas de mensajes, avisos, alertas y salidas de comunicación generadas por el sistema, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `notifications`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `notifications`
- diseñar o revisar contratos públicos del dominio de notificaciones
- ubicar correctamente lógica de notificaciones dentro de `src/features/notifications/`
- separar notifications de automation, integrations, reporting o lógica fuente de otros módulos
- validar si una pieza del dominio de notificaciones afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `notifications`
- revisar si una pieza legacy relacionada con notificaciones merece migrarse al módulo

---

## Ownership del módulo

El módulo `notifications` es owner de los concerns relacionados con la generación y entrega de comunicaciones del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- notificaciones del sistema
- alertas
- avisos operativos
- plantillas o estructuras de mensajes
- estados de entrega
- preferencias de notificación cuando pertenezcan al dominio de comunicaciones
- validaciones funcionales para decidir cómo se emite o registra una notificación

El módulo `notifications` no es owner de:

- identidad, sesión o tenant actual
- lógica fuente de negocio de otros módulos
- automation como orquestación automática
- integrations como conectividad externa
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

- definir el alcance exacto del módulo `notifications`
- diseñar contratos públicos del dominio de notificaciones
- ubicar casos de uso de avisos o alertas dentro de la arquitectura oficial
- revisar si una solución mezcla `notifications` con `automation`, `integrations`, `reporting` o lógica interna de otros módulos
- validar impacto de tenancy y permisos en una notificación
- planificar trabajo pequeño y cerrado dentro de `notifications`
- revisar si una pieza legacy de notificaciones debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver lógica fuente de negocio de otros módulos dentro de `notifications`
- mezclar `notifications` con automation o integrations sin límites claros
- rediseñar el sistema global de eventos del producto
- tocar módulos no relacionados por conveniencia
- usar `notifications` como contenedor genérico de cualquier proceso asíncrono
- rehacer varios dominios a la vez
- duplicar lógica de negocio de otros módulos en lugar de consumir contratos públicos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `notifications`.

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
2. validación de ownership dentro de `notifications`
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
5. No meter lógica de `notifications` en `src/app/`.
6. No meter lógica de `notifications` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de notificaciones.
8. No duplicar lógica de otros módulos dentro de notifications si existe contrato público.
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

- ¿esta tarea pertenece realmente a `notifications`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué mensajes, alertas o entregas toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `notifications`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `notifications`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `notifications` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `notifications`
- evita mezclar notificaciones con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para emitir una notificación
- decidir dónde vive una regla de plantilla o canal de entrega
- revisar si una validación pertenece al dominio de notifications o a otro módulo
- ubicar acceso a datos de notificaciones dentro del módulo
- planificar una tarea cerrada del módulo `notifications`

---

## Ejemplos de uso incorrectos

- mezclar notifications con automation, integrations y reporting en una sola tarea
- duplicar lógica fuente de otros módulos dentro de notifications
- mover lógica de otros módulos al dominio de notificaciones por comodidad
- usar `notifications` como módulo genérico de “cualquier proceso asíncrono”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`notifications` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `notifications` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
