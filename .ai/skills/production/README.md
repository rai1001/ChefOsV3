# ChefOS v3 Production Skill

## Objetivo

`production` es la skill interna del módulo `production` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre ejecución operativa de producción, órdenes, planificación productiva y transformaciones operativas dentro del sistema, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `production`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `production`
- diseñar o revisar contratos públicos del dominio de producción
- ubicar correctamente lógica de ejecución productiva dentro de `src/features/production/`
- separar producción de recetas, inventario, procurement o automatización
- validar si una pieza del dominio de producción afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `production`
- revisar si una pieza legacy relacionada con producción merece migrarse al módulo

---

## Ownership del módulo

El módulo `production` es owner de los concerns relacionados con la ejecución operativa de procesos productivos dentro del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- órdenes de producción
- planificación operativa de producción
- estados de producción
- consumo o transformación operativa cuando pertenecen al proceso productivo
- salidas o resultados de producción
- validaciones funcionales de ejecución productiva
- contexto necesario para fabricar, preparar o transformar elementos operativos

El módulo `production` no es owner de:

- identidad, sesión o tenant actual
- recetas como definición técnica o formulación
- inventario como estado de stock general
- procurement como proceso de compra
- catálogo como estructura publicable o comercial
- reporting transversal
- automatizaciones genéricas
- integraciones ajenas al dominio de producción
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `production`
- diseñar contratos públicos del dominio de producción
- ubicar casos de uso de ejecución productiva dentro de la arquitectura oficial
- revisar si una solución mezcla `production` con `recipes`, `inventory`, `procurement` o `automation`
- validar impacto de tenancy y permisos en una operación de producción
- planificar trabajo pequeño y cerrado dentro de `production`
- revisar si una pieza legacy de producción debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver formulación de recetas dentro de `production`
- mezclar `production` con reporting o automatizaciones genéricas sin límites claros
- diseñar automatizaciones globales fuera del ownership del módulo
- tocar módulos no relacionados por conveniencia
- usar `production` como contenedor genérico de cualquier flujo operativo
- rehacer varios dominios a la vez
- definir compras o stock general como si fueran parte de producción cuando pertenecen a otros módulos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `production`.

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
2. validación de ownership dentro de `production`
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
5. No meter lógica de `production` en `src/app/`.
6. No meter lógica de `production` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de producción.
8. No mezclar reglas de producción con recetas, inventario, compras o automatización sin contrato claro.
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

- ¿esta tarea pertenece realmente a `production`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos de producción toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `production`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `production`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `production` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `production`
- evita mezclar producción con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para crear o consultar una orden de producción
- decidir dónde vive una regla de estado o ejecución productiva
- revisar si una validación pertenece al dominio de production o a UI
- ubicar acceso a datos de producción dentro del módulo
- planificar una tarea cerrada del módulo `production`

---

## Ejemplos de uso incorrectos

- mezclar production con inventory, procurement e automation en una sola tarea
- resolver formulación completa dentro de `production`
- mover lógica de otros módulos al dominio de producción por comodidad
- usar `production` como módulo genérico de “todo lo operativo”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`production` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `production` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
