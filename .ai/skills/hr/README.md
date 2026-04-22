# ChefOS v3 HR Skill

## Objetivo

`hr` es la skill interna del módulo `hr` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre recursos humanos, personas, estructura operativa de personal y procesos internos relacionados con gestión de equipo, siempre dentro de la arquitectura oficial del proyecto y con ownership claro.

No existe para resolver todo el producto.

Existe para trabajar de forma controlada sobre el módulo `hr`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece realmente al módulo `hr`
- diseñar o revisar contratos públicos del dominio de recursos humanos
- ubicar correctamente lógica de `hr` dentro de `src/features/hr/`
- separar `hr` de `identity`, `commercial`, `compliance` o `automation`
- validar si una pieza del dominio de `hr` afecta permisos, tenancy o límites de módulo
- planificar una implementación pequeña y cerrada dentro de `hr`
- revisar si una pieza legacy relacionada con `hr` merece migrarse al módulo

---

## Ownership del módulo

El módulo `hr` es owner de los concerns relacionados con personas, roles operativos internos y estructura funcional de personal dentro del sistema.

Según el alcance concreto del proyecto, esto puede incluir:

- perfiles internos de personal
- asignaciones operativas de personal
- estructura funcional interna de equipos
- estados operativos relacionados con personas
- información de personal necesaria para operación interna
- reglas funcionales del dominio de recursos humanos
- contexto necesario para operar procesos internos vinculados al personal

El módulo `hr` no es owner de:

- identidad, sesión o tenant actual
- autenticación base
- commercial
- recipes
- catalog
- procurement
- inventory
- production
- reporting
- compliance como dominio de control transversal
- automation como orquestación genérica
- integrations como conectividad externa
- UI compartida global

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `hr`
- diseñar contratos públicos del dominio de recursos humanos
- ubicar casos de uso de `hr` dentro de la arquitectura oficial
- revisar si una solución mezcla `hr` con `identity`, `commercial`, `compliance` o `automation`
- validar impacto de tenancy y permisos en una operación de `hr`
- planificar trabajo pequeño y cerrado dentro de `hr`
- revisar si una pieza legacy de `hr` debe migrarse o descartarse

---

## Casos de uso no válidos

No usar esta skill para:

- resolver autenticación o sesión dentro de `hr`
- mezclar `hr` con identity o compliance sin límites claros
- rediseñar toda la estructura organizativa del sistema sin alcance cerrado
- tocar módulos no relacionados por conveniencia
- usar `hr` como contenedor genérico de cualquier dato de usuario
- rehacer varios dominios a la vez
- duplicar lógica de identidad o permisos base que pertenecen a otros módulos

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `hr`.

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
2. validación de ownership dentro de `hr`
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
5. No meter lógica de `hr` en `src/app/`.
6. No meter lógica de `hr` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de recursos humanos.
8. No duplicar lógica de otros módulos dentro de `hr` si existe contrato público.
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

- ¿esta tarea pertenece realmente a `hr`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿qué datos o procesos de personal toca?
- ¿qué restricciones de acceso o tenancy aplican?
- ¿qué dependencias autorizadas necesita `hr`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y comportamiento?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `hr`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `hr` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `hr`
- evita mezclar recursos humanos con otros dominios por conveniencia
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para consultar una entidad interna de personal
- decidir dónde vive una regla funcional de asignación o estado de personal
- revisar si una validación pertenece al dominio de `hr` o a otro módulo
- ubicar acceso a datos de recursos humanos dentro del módulo
- planificar una tarea cerrada del módulo `hr`

---

## Ejemplos de uso incorrectos

- mezclar hr con identity, compliance y automation en una sola tarea
- duplicar lógica fuente de otros módulos dentro de `hr`
- mover lógica de otros módulos al dominio de recursos humanos por comodidad
- usar `hr` como módulo genérico de “todo lo relacionado con usuarios”
- rehacer el dominio completo sin alcance cerrado

---

## Estado de esta skill

`hr` es una skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `hr` con ownership claro, contratos públicos estables y respeto estricto por tenancy, permisos y arquitectura oficial.
