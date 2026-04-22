# ChefOS v3 Procurement Skill

## Objetivo

`procurement` es la skill interna del módulo `procurement` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre compras, abastecimiento, relación operativa con proveedores y procesos de aprovisionamiento, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `procurement`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `procurement`
- diseñar o revisar contratos públicos del dominio de procurement
- ubicar correctamente lógica de compras y abastecimiento dentro de `src/features/procurement/`
- separar procurement de inventario, catálogo, producción o integraciones
- validar si una pieza del dominio de procurement afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `procurement`
- revisar si una pieza legacy relacionada con compras merece migrarse al módulo

---

## Ownership del módulo

El módulo `procurement` es owner de los concerns relacionados con la adquisición y abastecimiento operativo del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- proveedores
- solicitudes de compra
- órdenes de compra
- estados de compra o abastecimiento
- reglas de reposición o abastecimiento cuando pertenecen al proceso de compra
- validaciones funcionales de procesos de procurement
- contexto necesario para comprar o aprovisionar insumos o recursos

El módulo `procurement` no es owner de:

- identidad, sesión o tenant actual
- catálogo como dominio estructural
- recetas
- inventario como estado de stock
- producción
- reporting
- automatizaciones genéricas
- integraciones ajenas al dominio de procurement
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `procurement`
- diseñar contratos públicos del dominio de compras y abastecimiento
- ubicar casos de uso de procurement dentro de la arquitectura oficial
- revisar si una solución mezcla `procurement` con `inventory`, `catalog`, `production` o `integrations`
- validar impacto de tenancy y permisos en una operación de compra
- planificar trabajo pequeño y cerrado dentro de `procurement`
- revisar si una pieza legacy de procurement debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver inventario completo dentro de `procurement`
- mezclar `procurement` con producción o reporting sin límites claros
- diseñar automatizaciones genéricas fuera del ownership del módulo
- tocar módulos no relacionados por conveniencia
- usar `procurement` como contenedor genérico de cualquier dato operativo
- rehacer varios dominios a la vez
- definir stock o movimientos de almacén como si fueran parte de procurement cuando pertenecen a `inventory`

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `procurement`.

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
2. validación de ownership dentro de `procurement`
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
5. No meter lógica de `procurement` en `src/app/`.
6. No meter lógica de `procurement` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de procurement.
8. No mezclar reglas de compras con inventario, producción o integraciones sin contrato claro.
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

- ¿esta tarea pertenece realmente a `procurement`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos de compras o abastecimiento toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `procurement`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `procurement`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `procurement` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `procurement`
- evita mezclar compras con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para crear o consultar una orden de compra
- decidir dónde vive una regla de aprobación o estado de compra
- revisar si una validación pertenece al dominio de procurement o a UI
- ubicar acceso a datos de compras dentro del módulo
- planificar una tarea cerrada del módulo `procurement`

---

## Ejemplos de uso incorrectos

- mezclar procurement con inventory, production e integrations en una sola tarea
- resolver stock completo dentro de `procurement`
- mover lógica de otros módulos al dominio de compras por comodidad
- usar `procurement` como módulo genérico de “todo lo operativo”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`procurement` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `procurement` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
