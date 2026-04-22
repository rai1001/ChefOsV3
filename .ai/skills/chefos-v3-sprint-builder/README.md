# ChefOS v3 Sprint Builder

## Objetivo

`chefos-v3-sprint-builder` es la skill transversal de planificación operativa de sprints de ChefOS v3.

Su propósito es convertir objetivos difusos o demasiado amplios en sprints pequeños, cerrados, revisables y compatibles con la arquitectura oficial del proyecto.

No existe para hacer roadmap infinito.

Existe para bajar trabajo real a sprints concretos, con alcance claro, foco único y criterio explícito de cierre.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- convertir una iniciativa en un sprint pequeño
- definir alcance incluido y fuera de alcance
- decidir si una idea cabe en un sprint o debe partirse
- fijar módulo principal o foco transversal
- construir tareas cerradas y verificables
- definir riesgos y bloqueos del sprint
- dejar criterios de cierre alineados con definition of done

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- construir un nuevo sprint oficial del proyecto
- revisar si un sprint propuesto está demasiado grande
- partir una iniciativa en sprints más pequeños
- fijar tareas cerradas dentro de un sprint
- evitar mezcla de varios dominios en un mismo sprint
- aterrizar entregables y criterios de cierre de una fase concreta

---

## Casos de uso no válidos

No usar esta skill para:

- diseñar todo el roadmap del producto en una sola ejecución
- justificar sprints ambiguos o abiertos
- mezclar varios módulos sin foco principal claro
- resolver implementación técnica detallada de una tarea
- rehacer arquitectura
- migrar legacy directamente
- aprobar trabajo ya implementado

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de un objetivo concreto.

Como mínimo, debe recibir:

- objetivo exacto
- módulo principal o naturaleza transversal
- alcance deseado
- dependencias previas
- fuera de alcance
- riesgos conocidos si existen
- si afecta datos, permisos o tenancy
- si implica legacy o no

---

## Salidas esperadas

La salida de esta skill debe producir, como mínimo:

1. nombre del sprint
2. objetivo del sprint
3. alcance incluido
4. fuera de alcance
5. módulo o foco principal
6. tareas cerradas del sprint
7. riesgos y bloqueos
8. criterios de cierre
9. validación contra definition of done

La salida debe ser concreta, pequeña y planificable.

---

## Reglas obligatorias

1. No inventar arquitectura nueva.
2. No rehacer el stack.
3. No mezclar varios objetivos grandes en un mismo sprint.
4. No usar un sprint para “avanzar varias cosas”.
5. No tocar módulos no relacionados sin justificación explícita.
6. No convertir una migración amplia en una sola tarea difusa.
7. No ignorar permisos, tenancy o límites modulares cuando aplican.
8. No proponer tareas ambiguas o no verificables.
9. No cerrar un sprint sin entregables concretos.
10. Todo sprint debe poder revisarse contra definition of done.

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

Antes de proponer un sprint, esta skill debe poder responder:

- ¿este objetivo cabe realmente en un sprint?
- ¿qué módulo domina el alcance?
- ¿qué cosas no deben entrar?
- ¿qué tareas deben quedar cerradas y verificables?
- ¿qué riesgos de expansión lateral existen?
- ¿qué dependencias previas son obligatorias?
- ¿qué haría que el sprint no fuera aprobable?
- ¿cómo se valida el cierre contra definition of done?

Si no puede responder esto con claridad, el sprint no está bien construido.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Nombre del sprint
2. Objetivo del sprint
3. Alcance incluido
4. Fuera de alcance
5. Módulo o foco principal
6. Tareas cerradas del sprint
7. Riesgos y bloqueos
8. Criterios de cierre
9. Validación contra definition of done

---

## Criterios de calidad de la skill

Una ejecución de `chefos-v3-sprint-builder` se considera buena cuando:

- reduce ambigüedad
- convierte un objetivo en un sprint realmente pequeño
- evita mezclar varias iniciativas
- deja tareas verificables
- protege límites modulares
- contempla datos, permisos y tenancy cuando aplican
- deja claro qué no debe tocarse
- produce una salida planificable y revisable

---

## Ejemplos de uso correctos

- convertir la base de `commercial` en Sprint 02
- decidir si una iniciativa de `inventory` debe partirse en dos sprints
- definir tareas cerradas para el sprint de `agents`
- revisar si un sprint mezcla reporting y automation sin control
- fijar entregables y criterios de cierre de un sprint funcional

---

## Ejemplos de uso incorrectos

- planificar todo el producto en una sola pasada
- meter varios módulos sin foco principal
- usar el sprint para justificar trabajo lateral
- crear tareas vagas como “avanzar base”
- usar la skill para implementar en vez de planificar

---

## Estado de esta skill

`chefos-v3-sprint-builder` es una skill transversal base de ChefOS v3.

Su función es convertir objetivos del proyecto en sprints pequeños, cerrados y revisables, con foco claro, tareas verificables y compatibilidad con la arquitectura, el workflow y la definition of done del proyecto.
