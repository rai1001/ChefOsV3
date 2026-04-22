# ChefOS v3 Compliance Skill

## Objetivo

`compliance` es la skill interna del módulo `compliance` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre cumplimiento, controles, validaciones regulatorias u operativas, trazabilidad y restricciones normativas del sistema, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `compliance`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `compliance`
- diseñar o revisar contratos públicos del dominio de compliance
- ubicar correctamente lógica de cumplimiento dentro de `src/features/compliance/`
- separar compliance de identity, reporting, automation o integrations
- validar si una pieza del dominio de compliance afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `compliance`
- revisar si una pieza legacy relacionada con compliance merece migrarse al módulo

---

## Ownership del módulo

El módulo `compliance` es owner de los concerns relacionados con cumplimiento, controles obligatorios y restricciones formales del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- controles de cumplimiento operativo
- validaciones normativas o procedimentales
- trazabilidad requerida por procesos sensibles
- evidencias o estados de cumplimiento
- reglas de bloqueo o advertencia por incumplimiento
- requisitos formales de registro cuando pertenecen al dominio de compliance
- restricciones funcionales necesarias para operar bajo reglas de control

El módulo `compliance` no es owner de:

- identidad, sesión o tenant actual
- reporting como salida analítica general
- automatizaciones genéricas
- integraciones ajenas al dominio de compliance
- lógica operativa fuente de otros módulos
- commercial
- recipes
- catalog
- procurement
- inventory
- production
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `compliance`
- diseñar contratos públicos del dominio de cumplimiento
- ubicar casos de uso de compliance dentro de la arquitectura oficial
- revisar si una solución mezcla `compliance` con `identity`, `reporting`, `automation` o `integrations`
- validar impacto de tenancy y permisos en una restricción o control
- planificar trabajo pequeño y cerrado dentro de `compliance`
- revisar si una pieza legacy de compliance debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver autenticación o sesión dentro de `compliance`
- mezclar `compliance` con reporting o automation sin límites claros
- rediseñar controles globales del sistema sin alcance cerrado
- tocar módulos no relacionados por conveniencia
- usar `compliance` como contenedor genérico de cualquier validación del producto
- rehacer varios dominios a la vez
- duplicar lógica fuente de otros módulos en lugar de aplicar controles sobre contratos claros

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `compliance`.

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
2. validación de ownership dentro de `compliance`
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
5. No meter lógica de `compliance` en `src/app/`.
6. No meter lógica de `compliance` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de compliance.
8. No duplicar lógica de otros módulos dentro de compliance si existe contrato público.
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

- ¿esta tarea pertenece realmente a `compliance`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos, controles o trazabilidad toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `compliance`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `compliance`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `compliance` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `compliance`
- evita mezclar cumplimiento con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para evaluar un control de cumplimiento
- decidir dónde vive una regla de bloqueo o validación obligatoria
- revisar si una validación pertenece al dominio de compliance o a otro módulo
- ubicar acceso a datos de trazabilidad dentro del módulo
- planificar una tarea cerrada del módulo `compliance`

---

## Ejemplos de uso incorrectos

- mezclar compliance con identity, reporting e automation en una sola tarea
- duplicar reglas fuente de otros módulos dentro de compliance
- mover lógica de otros módulos al dominio de cumplimiento por comodidad
- usar `compliance` como módulo genérico de “cualquier validación”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`compliance` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `compliance` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
