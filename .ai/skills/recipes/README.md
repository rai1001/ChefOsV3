# ChefOS v3 Recipes Skill

## Objetivo

`recipes` es la skill interna del módulo `recipes` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre recetas, formulaciones, composición técnica y reglas propias del dominio de recetas, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `recipes`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `recipes`
- diseñar o revisar contratos públicos del dominio de recetas
- ubicar correctamente lógica de recetas dentro de `src/features/recipes/`
- separar formulación, validación y reglas de receta de UI, catálogo, inventario o producción
- validar si una pieza del dominio de recetas afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `recipes`
- revisar si una pieza legacy relacionada con recetas merece migrarse al módulo

---

## Ownership del módulo

El módulo `recipes` es owner de los concerns relacionados con la definición técnica y funcional de recetas.

Según el alcance concreto del proyecto, esto puede incluir:

- definición de receta
- formulación o composición
- ingredientes o componentes asociados a una receta
- cantidades, unidades y reglas de estructura de receta
- versiones o estados internos de receta
- validaciones propias del dominio de recetas
- reglas funcionales necesarias para que una receta exista como entidad operativa

El módulo `recipes` no es owner de:

- catálogo comercial o publicable
- procurement
- inventario
- producción como ejecución operativa
- reporting
- identity
- automatizaciones genéricas
- integraciones ajenas al dominio de recetas
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `recipes`
- diseñar contratos públicos del dominio de recetas
- ubicar casos de uso de recetas dentro de la arquitectura oficial
- revisar si una solución mezcla `recipes` con `catalog`, `inventory` o `production`
- validar impacto de tenancy y permisos en una operación sobre recetas
- planificar trabajo pequeño y cerrado dentro de `recipes`
- revisar si una pieza legacy de recetas debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver catálogo completo dentro de `recipes`
- mezclar `recipes` con producción o inventario sin límites claros
- diseñar reporting transversal del sistema
- tocar módulos no relacionados por conveniencia
- usar `recipes` como contenedor genérico de cualquier dato culinario u operativo
- rehacer varios dominios a la vez
- definir procesos de compra o stock como si fueran parte de receta

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `recipes`.

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
2. validación de ownership dentro de `recipes`
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
5. No meter lógica de `recipes` en `src/app/`.
6. No meter lógica de `recipes` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de recetas.
8. No mezclar reglas de receta con catálogo, inventario o producción sin contrato claro.
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

- ¿esta tarea pertenece realmente a `recipes`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos de receta toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `recipes`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `recipes`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `recipes` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `recipes`
- evita mezclar recetas con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para crear o consultar una receta
- decidir dónde vive una validación de composición de receta
- revisar si una regla pertenece al dominio de receta o a producción
- ubicar acceso a datos de recetas dentro del módulo
- planificar una tarea cerrada del módulo `recipes`

---

## Ejemplos de uso incorrectos

- mezclar recetas con catálogo, procurement e inventory en una sola tarea
- resolver producción dentro de `recipes`
- mover lógica de otros módulos al dominio de recetas por comodidad
- usar `recipes` como módulo genérico de “todo lo culinario”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`recipes` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `recipes` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
