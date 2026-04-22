# ChefOS v3 Reporting Skill

## Objetivo

`reporting` es la skill interna del módulo `reporting` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre reporting, métricas, agregaciones, vistas analíticas y salidas de información para seguimiento operativo o de negocio, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `reporting`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `reporting`
- diseñar o revisar contratos públicos del dominio de reporting
- ubicar correctamente lógica de reporting dentro de `src/features/reporting/`
- separar reporting de commercial, inventory, production o automation
- validar si una pieza del dominio de reporting afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `reporting`
- revisar si una pieza legacy relacionada con reporting merece migrarse al módulo

---

## Ownership del módulo

El módulo `reporting` es owner de los concerns relacionados con la obtención, estructuración y exposición de información analítica o de seguimiento dentro del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- métricas operativas
- métricas de negocio
- agregaciones y resúmenes
- vistas de reporting
- consultas analíticas
- filtros y salidas estructuradas para seguimiento
- reglas funcionales necesarias para construir reportes coherentes dentro del producto

El módulo `reporting` no es owner de:

- identidad, sesión o tenant actual
- lógica de negocio fuente de otros módulos
- commercial como dominio operativo
- recipes
- catalog
- procurement
- inventory
- production
- automatizaciones genéricas
- integraciones ajenas al dominio de reporting
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `reporting`
- diseñar contratos públicos del dominio de reporting
- ubicar casos de uso analíticos dentro de la arquitectura oficial
- revisar si una solución mezcla `reporting` con `commercial`, `inventory`, `production` o `automation`
- validar impacto de tenancy y permisos en un reporte o vista analítica
- planificar trabajo pequeño y cerrado dentro de `reporting`
- revisar si una pieza legacy de reporting debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver la lógica fuente de otros módulos dentro de `reporting`
- mezclar `reporting` con automatizaciones o integraciones sin límites claros
- rediseñar el dominio operativo de los módulos fuente
- tocar módulos no relacionados por conveniencia
- usar `reporting` como contenedor genérico de cualquier consulta improvisada
- rehacer varios dominios a la vez
- duplicar lógica de negocio de otros módulos en lugar de consumir contratos públicos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `reporting`.

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
2. validación de ownership dentro de `reporting`
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
5. No meter lógica de `reporting` en `src/app/`.
6. No meter lógica de `reporting` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de reporting.
8. No duplicar lógica de negocio de otros módulos dentro de reporting si existe contrato público.
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

- ¿esta tarea pertenece realmente a `reporting`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos o agregaciones analíticas toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `reporting`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `reporting`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `reporting` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `reporting`
- evita mezclar reporting con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para obtener un resumen analítico
- decidir dónde vive una agregación o filtro de reporting
- revisar si una validación pertenece al dominio de reporting o a UI
- ubicar acceso a datos analíticos dentro del módulo
- planificar una tarea cerrada del módulo `reporting`

---

## Ejemplos de uso incorrectos

- mezclar reporting con production, inventory e automation en una sola tarea
- duplicar reglas de negocio fuente dentro de reporting
- mover lógica de otros módulos al dominio analítico por comodidad
- usar `reporting` como módulo genérico de “cualquier consulta”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`reporting` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `reporting` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
