# ChefOS v3 Migrate Legacy

## Objetivo

`chefos-v3-migrate-legacy` es la skill transversal de migración controlada de legacy de ChefOS v3.

Su propósito es analizar una pieza legacy concreta y decidir, con criterio estricto, si debe:

- migrarse
- refactorizarse
- extraerse parcialmente
- descartarse

No existe para mover código viejo al proyecto nuevo por comodidad.

Existe para impedir copy-paste, arrastre de estructura antigua y migraciones sin destino, contrato, validación o trazabilidad.

---

## Propósito operativo

Esta skill existe para responder tareas como:

- clasificar una pieza legacy concreta
- decidir si una pieza debe migrarse o descartarse
- decidir módulo y capa destino
- definir contrato objetivo de una migración
- separar qué se rescata y qué se descarta
- proponer una estrategia mínima de migración
- revisar riesgos de permisos, tenancy y datos en una pieza heredada
- exigir tests, documentación y trazabilidad de Git para una migración

---

## Casos de uso válidos

Usar esta skill cuando se necesite:

- analizar una pieza legacy concreta
- decidir entre `reusable`, `refactor-required`, `extract-only` o `discard`
- ubicar correctamente el destino de una migración
- revisar si una pieza vieja contamina la arquitectura nueva
- planificar una migración cerrada y revisable
- definir contrato objetivo y validación de una migración
- evitar mover carpetas enteras como falsa migración

---

## Casos de uso no válidos

No usar esta skill para:

- migrar “todo lo útil” del legacy
- rediseñar arquitectura del proyecto
- mezclar varias migraciones no relacionadas
- justificar copy-paste rápido
- usar legacy como excusa para abrir refactors globales
- implementar una feature nueva no relacionada con migración
- cerrar migraciones sin tests ni rastro documental

---

## Entradas esperadas

Toda ejecución de esta skill debe partir de una pieza legacy concreta.

Como mínimo, debe recibir:

- pieza exacta a analizar
- ubicación actual
- comportamiento que aporta
- módulo destino propuesto
- capa destino propuesta
- motivo de la migración
- impacto esperado en datos
- impacto esperado en permisos
- impacto esperado en multi-tenant
- si afecta contrato público o no

---

## Salidas esperadas

La salida de esta skill debe producir, como mínimo:

1. resumen de la pieza legacy
2. clasificación
3. módulo y capa destino
4. contrato objetivo
5. estrategia mínima de migración
6. tests requeridos
7. documentación y trazabilidad en Git
8. riesgos y bloqueos
9. validación contra definition of done

La salida debe ser concreta, pequeña y revisable.

---

## Reglas obligatorias

1. No inventar arquitectura nueva.
2. No rehacer el stack.
3. No mezclar varias piezas heterogéneas en una sola migración.
4. No tocar módulos no relacionados.
5. No copiar y pegar código legacy sin adaptación.
6. No mover carpetas completas como falsa migración.
7. No usar `src/lib/` como destino por defecto por comodidad.
8. No ignorar tenancy, permisos o límites funcionales cuando aplican.
9. No dar por válida una migración sin contrato objetivo claro.
10. No cerrar una propuesta sin validación suficiente según riesgo.
11. No cerrar una migración si requería documentación y no queda rastro documental.
12. No cerrar una migración si no podría entrar a Git y PR con un alcance claro y revisable.

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
- `.ai/checklists/migration-checklist.md`

---

## Clasificaciones oficiales que debe usar

Esta skill solo puede clasificar una pieza legacy en uno de estos estados:

- `reusable`
- `refactor-required`
- `extract-only`
- `discard`

No debe inventar categorías nuevas.

---

## Preguntas que esta skill debe ayudar a responder

Antes de proponer una migración, esta skill debe poder responder:

- ¿qué pieza exacta se está analizando?
- ¿qué comportamiento útil aporta?
- ¿qué clasificación merece?
- ¿qué módulo debe ser owner del resultado?
- ¿qué capa destino es correcta?
- ¿qué se rescata y qué se descarta?
- ¿qué contrato público usa o crea?
- ¿qué riesgos hay de datos, permisos o tenancy?
- ¿qué tests hacen falta?
- ¿qué documentación debe actualizarse?
- ¿cómo entra la migración a rama, commits y PR con foco claro?

Si no puede responder esto con claridad, la migración no está madura.

---

## Formato recomendado de respuesta

Cuando esta skill se use, debe responder con esta estructura:

1. Resumen de la pieza legacy
2. Clasificación
3. Módulo y capa destino
4. Contrato objetivo
5. Estrategia mínima de migración
6. Tests requeridos
7. Documentación y trazabilidad en Git
8. Riesgos y bloqueos
9. Validación contra definition of done

---

## Criterios de calidad de la skill

Una ejecución de `chefos-v3-migrate-legacy` se considera buena cuando:

- evita copy-paste de legacy
- clasifica con claridad y sin ambigüedad
- define destino correcto dentro de la arquitectura oficial
- no abre rediseños globales
- deja claro qué se migra y qué no
- contempla datos, permisos y tenancy cuando aplican
- exige validación suficiente según riesgo
- deja rastro documental y trazabilidad suficiente para revisión

---

## Ejemplos de uso correctos

- clasificar un validador legacy de `recipes`
- decidir si un hook viejo de `identity` se refactoriza o se descarta
- extraer una regla útil desde un componente antiguo de `inventory`
- migrar una consulta SQL vieja a contrato nuevo en `supabase`
- revisar si una pieza heredada puede entrar a `commercial` sin contaminar el módulo

---

## Ejemplos de uso incorrectos

- migrar todo el legacy de un módulo de una sola vez
- mover carpetas enteras y revisar después
- copiar primero y limpiar luego
- usar legacy como atajo para rehacer varios módulos
- justificar una feature nueva como si fuera migración

---

## Estado de esta skill

`chefos-v3-migrate-legacy` es una skill transversal base de ChefOS v3.

Su función es proteger la arquitectura oficial del proyecto frente al legacy y permitir migraciones pequeñas, clasificadas, validadas, documentadas y trazables.
