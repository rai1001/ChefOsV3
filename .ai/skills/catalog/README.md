# ChefOS v3 Catalog Skill

## Objetivo

`catalog` es la skill interna del módulo `catalog` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre catálogo, entidades publicables, organización de oferta y estructuras visibles o comercializables del sistema, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `catalog`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `catalog`
- diseñar o revisar contratos públicos del dominio de catálogo
- ubicar correctamente lógica de catálogo dentro de `src/features/catalog/`
- separar catálogo de recetas, comercial, inventario o producción
- validar si una pieza del dominio de catálogo afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `catalog`
- revisar si una pieza legacy relacionada con catálogo merece migrarse al módulo

---

## Ownership del módulo

El módulo `catalog` es owner de los concerns relacionados con la organización, exposición y estructura del catálogo operativo o comercial del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- items o entidades catalogables
- agrupaciones, categorías o familias de catálogo
- estados de publicación o visibilidad
- atributos necesarios para presentar o estructurar oferta
- relaciones entre entidades publicables
- reglas funcionales necesarias para que una entidad forme parte del catálogo

El módulo `catalog` no es owner de:

- identidad, sesión o tenant actual
- lógica técnica de receta o formulación
- pipeline o contexto comercial
- procurement
- inventario
- producción
- reporting
- automatizaciones genéricas
- integraciones ajenas al dominio de catálogo
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `catalog`
- diseñar contratos públicos del dominio de catálogo
- ubicar casos de uso de catálogo dentro de la arquitectura oficial
- revisar si una solución mezcla `catalog` con `recipes`, `commercial`, `inventory` o `production`
- validar impacto de tenancy y permisos en una operación sobre catálogo
- planificar trabajo pequeño y cerrado dentro de `catalog`
- revisar si una pieza legacy de catálogo debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver formulación de recetas dentro de `catalog`
- mezclar `catalog` con comercial, inventario o producción sin límites claros
- diseñar reporting transversal del sistema
- tocar módulos no relacionados por conveniencia
- usar `catalog` como contenedor genérico de cualquier dato del producto
- rehacer varios dominios a la vez
- definir reglas de stock, compra o producción como si fueran parte de catálogo

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `catalog`.

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
2. validación de ownership dentro de `catalog`
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
5. No meter lógica de `catalog` en `src/app/`.
6. No meter lógica de `catalog` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de catálogo.
8. No mezclar reglas de catálogo con recetas, comercial, inventario o producción sin contrato claro.
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

- ¿esta tarea pertenece realmente a `catalog`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos de catálogo toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `catalog`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `catalog`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `catalog` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `catalog`
- evita mezclar catálogo con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para crear o consultar una entidad de catálogo
- decidir dónde vive una regla de visibilidad o publicación
- revisar si una validación pertenece al dominio de catálogo o a UI
- ubicar acceso a datos de catálogo dentro del módulo
- planificar una tarea cerrada del módulo `catalog`

---

## Ejemplos de uso incorrectos

- mezclar catálogo con recetas, procurement e inventory en una sola tarea
- resolver producción dentro de `catalog`
- mover lógica de otros módulos al dominio de catálogo por comodidad
- usar `catalog` como módulo genérico de “todo lo publicable y además otras cosas”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`catalog` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `catalog` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
