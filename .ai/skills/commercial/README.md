# ChefOS v3 Commercial Skill

## Objetivo

`commercial` es la skill interna del módulo `commercial` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre el dominio comercial del sistema con alcance cerrado, ownership claro y respeto estricto por la arquitectura oficial del proyecto.

No existe para resolver todo el negocio de ChefOS v3.

Existe para trabajar de forma controlada sobre procesos, contratos y piezas concretas del módulo comercial.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `commercial`
- diseñar o revisar contratos públicos del dominio comercial
- ubicar correctamente lógica comercial dentro de `src/features/commercial/`
- separar reglas comerciales de UI, reporting o integraciones
- validar si una pieza comercial afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `commercial`
- revisar si una pieza legacy comercial merece migrarse al módulo

---

## Ownership del módulo

El módulo `commercial` es owner de los concerns relacionados con la capa comercial del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- clientes o cuentas comerciales
- oportunidades o pipeline comercial
- presupuestos, propuestas o cotizaciones
- acuerdos comerciales
- estados comerciales del cliente
- contexto comercial necesario para operar procesos de venta o relación comercial

El módulo `commercial` no es owner de:

- identidad, sesión o tenant actual
- catálogo como dominio propio
- inventario
- producción
- reporting como módulo de análisis transversal
- automatizaciones genéricas
- integraciones ajenas al dominio comercial
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `commercial`
- diseñar contratos públicos del dominio comercial
- ubicar casos de uso comerciales dentro de la arquitectura oficial
- revisar si una solución mezcla comercial con catálogo, reporting o automation
- validar impacto de tenancy y permisos en una operación comercial
- planificar trabajo pequeño y cerrado dentro de `commercial`
- revisar si una pieza legacy comercial debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- rediseñar todo el dominio de negocio del proyecto
- mezclar `commercial` con `catalog`, `inventory` o `reporting` sin límites claros
- resolver toda la analítica comercial del sistema
- implementar automatizaciones genéricas fuera del ownership comercial
- tocar módulos no relacionados por conveniencia
- usar `commercial` como contenedor genérico de cualquier dato del cliente

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `commercial`.

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
2. validación de ownership dentro de `commercial`
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
5. No meter lógica de `commercial` en `src/app/`.
6. No meter lógica de `commercial` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica comercial.
8. No mezclar reglas comerciales con reporting o integraciones sin contrato claro.
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

- ¿esta tarea pertenece realmente a `commercial`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos comerciales toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `commercial`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `commercial`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `commercial` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `commercial`
- evita mezclar comercial con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para crear o consultar una entidad comercial
- decidir dónde vive una regla de estado comercial
- revisar si una validación pertenece al dominio comercial o a UI
- ubicar acceso a datos comerciales dentro del módulo
- planificar una tarea cerrada del módulo `commercial`

---

## Ejemplos de uso incorrectos

- mezclar comercial con reporting en una sola tarea
- resolver catálogo dentro de `commercial`
- mover lógica de otros módulos al dominio comercial por comodidad
- usar `commercial` como módulo genérico de “clientes y todo lo demás”
- rehacer el proceso comercial completo sin alcance cerrado

---

## Estado de esta skill

`commercial` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `commercial` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
