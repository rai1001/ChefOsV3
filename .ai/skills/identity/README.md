# ChefOS v3 Identity Skill

## Objetivo

`identity` es la skill interna del módulo `identity` de ChefOS v3.

Su propósito es guiar trabajo asistido sobre identidad, sesión, tenant actual, contexto de acceso y permisos base, siempre dentro de la arquitectura oficial del proyecto y sin invadir ownership de otros módulos.

No existe para resolver toda la seguridad del sistema.

Existe para trabajar con alcance cerrado sobre el módulo `identity`.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- definir qué pertenece al módulo `identity`
- diseñar o revisar el contrato público de identidad
- resolver sesión autenticada, usuario actual y tenant actual
- ubicar correctamente lógica de identidad dentro de `src/features/identity/`
- validar restricciones base de acceso
- evitar acceso caótico a identidad desde páginas, layouts o componentes compartidos
- preparar consumo de identidad por otros módulos mediante contrato público

---

## Ownership del módulo

El módulo `identity` es owner de los concerns relacionados con:

- sesión autenticada
- usuario actual
- tenant actual
- contexto base de acceso
- comprobaciones base de permiso
- resolución del contexto mínimo que otros módulos necesitan para operar con control

El módulo `identity` no es owner de:

- lógica de negocio específica de otros módulos
- permisos funcionales detallados de `inventory`, `catalog`, `production`, etc.
- workflows de negocio ajenos
- reglas operativas específicas de backoffice fuera de identidad y acceso base

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- definir el alcance exacto del módulo `identity`
- diseñar o refinar el contrato público de identidad
- decidir cómo exponer sesión, usuario y tenant actual
- validar el encaje arquitectónico de piezas de identidad
- revisar si una solución rompe multi-tenant o permisos base
- planificar una implementación pequeña y cerrada dentro de `identity`
- revisar si una pieza legacy relacionada con auth o sesión merece migrarse al módulo

---

## Casos de uso no válidos

No usar esta skill para:

- resolver todos los permisos del sistema
- diseñar toda la jerarquía organizativa futura
- implementar seguridad completa de todos los módulos
- rediseñar auth global sin alcance cerrado
- tocar módulos no relacionados
- mezclar trabajo de `identity` con features de negocio de otros dominios
- usar `identity` como contenedor genérico de cualquier lógica de usuario

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta dentro de `identity`.

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
2. validación de ownership dentro de `identity`
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
5. No meter lógica de `identity` en `src/app/`.
6. No meter lógica de `identity` en `src/components/`.
7. No usar `src/lib/` como destino por defecto para lógica de identidad.
8. No ignorar tenant actual como concern central del módulo.
9. No asumir permisos o acceso sin declararlos explícitamente.
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
- `.ai/sprints/sprint-01-identity.md`

---

## Preguntas que esta skill debe ayudar a responder

Antes de proponer una solución, esta skill debe poder responder:

- ¿esta tarea pertenece realmente a `identity`?
- ¿qué parte del cambio es contrato público?
- ¿qué parte del cambio es lógica interna del módulo?
- ¿cómo se resuelven sesión, usuario y tenant actual?
- ¿qué restricciones de acceso base aplican?
- ¿qué dependencias autorizadas necesita `identity`?
- ¿qué cosas deben quedar fuera para no mezclar otros módulos?
- ¿qué tests hacen falta para validar contrato, permisos y tenancy?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership dentro de `identity`
3. Encaje arquitectónico
4. Contrato público
5. Archivos o carpetas a crear o modificar
6. Restricciones de permisos y tenancy
7. Tests requeridos
8. Riesgos y bloqueos
9. Criterio mínimo para pasar a implementación

---

## Criterios de calidad de la skill

Una ejecución de `identity` se considera buena cuando:

- deja claro qué pertenece y qué no pertenece al módulo
- protege la frontera pública de `identity`
- evita acceso disperso a sesión o tenant desde cualquier capa
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- produce una salida pequeña, concreta y ejecutable
- deja tests proporcionales al riesgo

---

## Ejemplos de uso correctos

- definir contrato para obtener usuario y tenant actual
- decidir dónde vive una verificación base de acceso
- revisar si un hook de sesión pertenece al contrato público
- ubicar una integración con Supabase Auth dentro del módulo
- planificar una tarea cerrada de `identity` para Sprint 01

---

## Ejemplos de uso incorrectos

- diseñar todo el sistema de permisos definitivo
- mezclar `identity` con flujos de `hr` o `commercial`
- mover lógica de otros módulos a `identity` por conveniencia
- usar `identity` como módulo genérico de “cosas del usuario”
- rehacer auth global sin alcance cerrado

---

## Estado de esta skill

`identity` es la primera skill por módulo de ChefOS v3.

Su función es ayudar a construir el módulo `identity` con ownership claro, contrato público estable y respeto estricto por tenancy, permisos y arquitectura oficial.
