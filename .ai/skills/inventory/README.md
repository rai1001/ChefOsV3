# ChefOS v3 Inventory Skill

## Objetivo

`inventory` es la skill interna del módulo `inventory` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre stock, existencias, movimientos, disponibilidad y control operativo de inventario, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `inventory`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `inventory`
- diseñar o revisar contratos públicos del dominio de inventario
- ubicar correctamente lógica de stock y movimientos dentro de `src/features/inventory/`
- separar inventario de procurement, catálogo, recetas o producción
- validar si una pieza del dominio de inventario afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `inventory`
- revisar si una pieza legacy relacionada con inventario merece migrarse al módulo

---

## Ownership del módulo

El módulo `inventory` es owner de los concerns relacionados con el estado operativo de existencias dentro del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- stock actual
- movimientos de inventario
- ajustes de existencias
- entradas y salidas de stock cuando pertenecen al dominio de inventario
- disponibilidad operativa
- snapshots o estados de inventario
- reglas funcionales para control y consistencia de existencias

El módulo `inventory` no es owner de:

- identidad, sesión o tenant actual
- procurement como proceso de compra
- catálogo como estructura comercial o publicable
- recetas como formulación
- producción como ejecución operativa
- reporting transversal
- automatizaciones genéricas
- integraciones ajenas al dominio de inventario
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `inventory`
- diseñar contratos públicos del dominio de inventario
- ubicar casos de uso de stock y movimientos dentro de la arquitectura oficial
- revisar si una solución mezcla `inventory` con `procurement`, `production`, `catalog` o `recipes`
- validar impacto de tenancy y permisos en una operación de inventario
- planificar trabajo pequeño y cerrado dentro de `inventory`
- revisar si una pieza legacy de inventario debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver compras completas dentro de `inventory`
- mezclar `inventory` con producción o reporting sin límites claros
- diseñar automatizaciones genéricas fuera del ownership del módulo
- tocar módulos no relacionados por conveniencia
- usar `inventory` como contenedor genérico de cualquier dato operativo
- rehacer varios dominios a la vez
- definir formulación de recetas o procesos comerciales como si fueran parte de inventario

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `inventory`.

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
2. validación de ownership dentro de `inventory`
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
5. No meter lógica de `inventory` en `src/app/`.
6. No meter lógica de `inventory` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de inventario.
8. No mezclar reglas de stock con procurement, producción o reporting sin contrato claro.
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

- ¿esta tarea pertenece realmente a `inventory`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos de stock o movimientos toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `inventory`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `inventory`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `inventory` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `inventory`
- evita mezclar inventario con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para consultar stock actual
- decidir dónde vive una regla de movimiento o ajuste de inventario
- revisar si una validación pertenece al dominio de inventory o a UI
- ubicar acceso a datos de inventario dentro del módulo
- planificar una tarea cerrada del módulo `inventory`

---

## Ejemplos de uso incorrectos

- mezclar inventory con procurement, production e integrations en una sola tarea
- resolver compras completas dentro de `inventory`
- mover lógica de otros módulos al dominio de inventario por comodidad
- usar `inventory` como módulo genérico de “todo lo operativo”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`inventory` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `inventory` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
