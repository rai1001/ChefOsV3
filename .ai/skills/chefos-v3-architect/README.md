# ChefOS v3 Architect

## Objetivo

`chefos-v3-architect` es la skill transversal de arquitectura operativa de ChefOS v3.

Su propósito es ayudar a aterrizar tareas concretas dentro de la arquitectura oficial del proyecto, con foco en:

- ownership correcto
- capa correcta
- contrato público claro
- alcance cerrado
- permisos y tenancy cuando aplican
- implementación mínima revisable

No existe para rediseñar el proyecto completo.

Existe para evitar decisiones improvisadas de estructura, ubicación o límites entre módulos.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- decidir en qué módulo debe vivir un cambio
- decidir en qué capa debe vivir una pieza
- revisar si una solución rompe la arquitectura oficial
- validar si un contrato público está bien planteado
- evitar lógica de negocio en `src/app/` o `src/components/`
- impedir cruces entre módulos sin contrato
- aterrizar una implementación mínima sin abrir refactors laterales

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- validar ownership de una tarea
- ubicar correctamente archivos o carpetas
- decidir si algo pertenece a `src/features`, `src/lib`, `src/components` o `supabase`
- revisar límites entre módulos
- definir contrato público de una pieza
- bajar una tarea cerrada a una implementación arquitectónicamente correcta
- revisar si un cambio propuesto rompe el diseño oficial del repo

---

## Casos de uso no válidos

No usar esta skill para:

- rehacer el stack
- redefinir toda la arquitectura del repo por intuición
- mezclar varias tareas no relacionadas
- revisar roadmap completo
- migrar legacy sin clasificación
- construir un sprint entero
- resolver una implementación completa de negocio fuera de una tarea cerrada

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una tarea concreta.

Como mínimo, debe recibir:

- tarea exacta
- módulo principal afectado
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

1. resumen operativo
2. ownership y límites del módulo
3. encaje arquitectónico
4. contrato público necesario
5. implementación mínima
6. tests requeridos
7. riesgos y bloqueos
8. validación contra definition of done

La salida debe ser concreta, pequeña y revisable.

---

## Reglas obligatorias

1. No inventar arquitectura nueva.
2. No rehacer el stack.
3. No mezclar varias tareas en una sola ejecución.
4. No tocar módulos no relacionados.
5. No meter lógica de negocio en `src/app/`.
6. No meter lógica de negocio en `src/components/`.
7. No usar `src/lib/` como cajón de sastre para dominio.
8. No cruzar límites entre módulos sin contrato público.
9. No ignorar tenancy, permisos o datos cuando aplican.
10. No cerrar una propuesta sin validación suficiente según riesgo.

---

## Documentos base que debe respetar

Esta skill debe operar alineada con:

- `.ai/README.md`
- `.ai/WORKFLOW.md`
- `.ai/specs/architecture.md`
- `.ai/specs/coding-standards.md`
- `.ai/specs/testing-standards.md`
- `.ai/specs/migration-policy.md`
- `.ai/specs/documentation-standards.md`
- `.ai/specs/git-workflow.md`
- `.ai/specs/definition-of-done.md`
- `.ai/specs/module-template.md`

---

## Preguntas que esta skill debe ayudar a responder

Antes de proponer una solución, esta skill debe poder responder:

- ¿qué módulo es realmente owner de esta tarea?
- ¿qué parte del cambio pertenece a otra capa?
- ¿qué contrato público existe o debe existir?
- ¿qué archivos deberían crearse o modificarse?
- ¿qué no debe tocarse?
- ¿qué riesgos hay de datos, permisos o tenancy?
- ¿qué tests hacen falta?
- ¿qué tendría que actualizarse en documentación o Git cuando aplique?

Si no puede responder esto con claridad, la propuesta no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen operativo
2. Ownership y límites del módulo
3. Encaje arquitectónico
4. Contrato público necesario
5. Implementación mínima
6. Tests requeridos
7. Riesgos y bloqueos
8. Validación contra definition of done

---

## Criterios de calidad de la skill

Una ejecución de `chefos-v3-architect` se considera buena cuando:

- reduce ambigüedad
- protege la arquitectura oficial
- deja claro qué pertenece y qué no pertenece al módulo
- ubica el cambio en la capa correcta
- no abre trabajo lateral
- contempla permisos y tenancy cuando aplican
- produce una salida concreta y revisable

---

## Ejemplos de uso correctos

- decidir dónde vive un contrato público de `identity`
- revisar si una consulta debe vivir en `inventory` o en `reporting`
- decidir si una validación va en `ui`, `application` o `domain`
- aterrizar una tarea cerrada del sprint en archivos concretos
- revisar si una propuesta rompe límites modulares

---

## Ejemplos de uso incorrectos

- rehacer toda la arquitectura del repo
- mezclar tres módulos en una sola tarea difusa
- usar la skill para justificar refactors laterales
- mover dominio a `src/lib` por comodidad
- resolver roadmap o planificación completa del proyecto

---

## Estado de esta skill

`chefos-v3-architect` es una skill transversal base de ChefOS v3.

Su función es proteger la arquitectura oficial del proyecto y ayudar a aterrizar tareas concretas con ownership claro, capas correctas, contratos públicos explícitos y alcance cerrado.
