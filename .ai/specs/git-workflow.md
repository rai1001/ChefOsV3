# ChefOS v3 Git Workflow

## Objetivo

Este documento define el workflow oficial de Git y GitHub para ChefOS v3.

Su propósito es asegurar que todo cambio del proyecto se integre con orden, trazabilidad y revisión estructurada, evitando:

- commits caóticos
- pushes sin criterio
- ramas ambiguas
- PRs con alcance mezclado
- cambios sin relación con sprint o tarea
- documentación o tests fuera de sincronía con el código
- integración de trabajo incompleto o no revisable

Este documento es normativo.

---

## Principios generales

1. Todo cambio debe tener alcance cerrado antes de tocar Git.
2. Toda rama debe responder a una tarea o sprint concreto.
3. Todo commit debe representar una unidad de cambio comprensible.
4. No se permite mezclar varias tareas distintas en un mismo commit o PR.
5. Ningún push debe usarse como basurero de trabajo sin ordenar.
6. Todo PR debe ser revisable contra arquitectura, testing, migración y done.
7. El historial debe ayudar a entender el proyecto, no entorpecerlo.
8. Documentación, código y tests deben viajar juntos cuando apliquen.
9. El trabajo no está cerrado por estar pusheado.
10. Push no equivale a done; merge tampoco equivale a done sin cumplir criteria.

---

## Flujo oficial de trabajo con Git

La secuencia oficial esperada es:

1. definir tarea
2. validar alcance
3. identificar sprint y módulo
4. crear rama con nombre claro
5. implementar cambio cerrado
6. actualizar tests y documentación cuando aplique
7. crear commits pequeños y coherentes
8. hacer push de la rama
9. abrir PR con contexto claro
10. revisar contra checklists y definition of done
11. corregir observaciones
12. mergear solo cuando el cambio sea aprobable

No se debe saltar del cambio local a un merge sin pasar por este flujo.

---

## Regla de ramas

Toda tarea debe trabajar sobre una rama explícita.

### Objetivos de la rama

La rama debe permitir identificar:

- qué se está haciendo
- a qué sprint pertenece si aplica
- qué módulo o área toca
- cuál es el alcance principal

### Regla de claridad

No usar ramas genéricas como:

- `fix`
- `changes`
- `test`
- `misc`
- `new-stuff`
- `update`

### Formato recomendado

Usar nombres como:

- `feat/identity-contract-base`
- `feat/commercial-base-contract`
- `chore/ai-docs-foundation`
- `refactor/inventory-public-contract`
- `docs/sprint-03-recipes`
- `migrate/recipes-legacy-validator`

### Regla de una rama, un foco

Una rama debe responder a un foco principal.

No mezclar en la misma rama:

- trabajo de varios módulos sin justificación clara
- una migración y una feature no relacionada
- un refactor lateral y una entrega funcional distinta
- varios sprints a la vez

---

## Regla de commits

Los commits deben ser:

- pequeños
- coherentes
- legibles
- trazables
- alineados con el cambio real

### Qué debe representar un commit

Un commit debe representar una unidad razonable de trabajo.

Ejemplos válidos:

- crear una spec
- añadir un checklist
- definir un contrato base de módulo
- añadir tests de una pieza concreta
- migrar una pieza legacy concreta
- corregir una validación asociada a una tarea cerrada

Ejemplos no válidos:

- mezclar documentación, refactor y feature no relacionada
- “varios arreglos”
- “cambios generales”
- “avance”
- “tmp”
- “wip final”
- “misc fixes”

---

## Estándar de mensajes de commit

Los mensajes deben ser claros y orientados a acción.

### Formato recomendado

```txt
<tipo>: <acción concreta>
```

### Tipos recomendados

- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `chore`
- `migrate`

### Ejemplos válidos

- `docs: add sprint 00 foundation`
- `docs: add documentation standards spec`
- `feat: define identity public contract`
- `test: add identity contract access coverage`
- `refactor: isolate inventory public entrypoint`
- `migrate: adapt legacy recipe validator to recipes module`
- `chore: create ai skills base structure`

### Ejemplos no válidos

- `update`
- `changes`
- `misc`
- `final`
- `fix stuff`
- `more work`
- `wip`

---

## Regla de commits WIP

Los commits WIP deben evitarse como estado final compartido.

Si se usan localmente para no perder trabajo:

- deben limpiarse antes del PR cuando sea razonable
- no deben convertirse en el lenguaje principal del historial
- no deben llegar a main como evidencia final del cambio

---

## Regla de staging

Antes de hacer commit, debe verificarse qué entra realmente.

Debe revisarse:

- que no entren archivos no relacionados
- que no entren cambios accidentales
- que no entren artefactos temporales
- que no entren modificaciones de otro módulo por error
- que documentación y tests relevantes no se queden fuera

No hacer commit “a ciegas” de todo el working tree.

---

## Regla de push

Push solo debe hacerse cuando la rama tenga un estado compartible y trazable.

Push sirve para:

- compartir avance ordenado
- abrir o actualizar PR
- guardar progreso con sentido
- permitir revisión
- sincronizar trabajo real

Push no debe usarse para:

- volcar cambios caóticos
- evitar revisar lo que se está subiendo
- compartir ramas con commits irrevisables
- sustituir el cierre estructurado de una tarea

---

## Regla de PR

Todo cambio relevante debe pasar por Pull Request.

**Un PR debe dejar claro:**
- objetivo del cambio
- alcance incluido
- fuera de alcance
- módulo principal afectado
- si toca datos, permisos o tenancy
- si toca contratos públicos
- tests añadidos o actualizados
- documentación actualizada cuando aplique
- relación con sprint o tarea

**No válido en un PR:**
- varios objetivos mezclados
- cambios sin contexto
- cambios sin tests cuando aplican
- cambios sin documentación cuando aplican
- cambios laterales no declarados
- PRs imposibles de revisar por tamaño o dispersión

---

## Regla de relación entre PR y sprint

Todo PR debe poder relacionarse con:

- un sprint
- una tarea del sprint
- o una pieza operativa claramente identificable

Si no puede responderse “este PR pertenece a qué trabajo concreto”, está mal planteado.

---

## Regla de revisión antes de merge

Antes de mergear, el PR debe revisarse contra:

- arquitectura
- coding standards
- testing standards
- migration policy
- documentation standards
- checklists aplicables
- definition of done

No se mergea por intuición ni por prisa.

---

## Regla de documentación y tests antes de push o PR

Si el cambio requiere documentación o tests, deben viajar con la misma rama y el mismo PR.

No dejar para después:

- specs afectadas
- sprints afectados
- contratos afectados
- tests necesarios
- checklists relevantes si cambia el sistema operativo del proyecto

---

## Regla de cambios en main

`main` debe reflejar solo trabajo ya integrado con criterio.

No usar `main` como rama de experimentación.

No hacer trabajo directo en `main` salvo caso excepcional, explícito y controlado.

La expectativa normal es:

1. rama de trabajo
2. commits claros
3. push
4. PR
5. revisión
6. merge

---

## Regla de squash o historial final

El criterio principal del historial final debe ser claridad.

Se admite squash si mejora legibilidad y mantiene trazabilidad del cambio.

No debe sacrificarse comprensión del cambio por conservar ruido del historial local.

---

## Regla de sincronización con revisión estructurada

Antes de considerar listo un PR, debe poder responderse:

- ¿el alcance está cerrado?
- ¿los commits son coherentes?
- ¿la rama representa una sola iniciativa clara?
- ¿el PR tiene contexto suficiente?
- ¿hay tests cuando aplican?
- ¿hay documentación cuando aplica?
- ¿el cambio cumple definition of done?

Si la respuesta es no, no está listo para merge.

---

## Reglas específicas para documentación en commits y PRs

### Cuando el cambio es documental

Debe reflejar exactamente qué documento se crea o actualiza.

Ejemplos válidos:
- `docs: add git workflow spec`
- `docs: add sprint 12 integrations`

### Cuando el cambio funcional afecta documentación

La documentación debe incluirse en la misma rama y el mismo PR.

No separar artificialmente:
- contrato funcional
- tests del contrato
- documentación del contrato

---

## Reglas específicas para migraciones

Si el cambio incluye migración de legacy:

- la rama debe reflejarlo
- el commit debe reflejarlo
- el PR debe explicitarlo
- la clasificación de la pieza debe estar clara
- el destino debe estar claro
- la validación debe estar clara

No se acepta una migración escondida dentro de un PR genérico.

---

## Señales de mal uso de Git en este proyecto

Se consideran señales de mal workflow:

- ramas con alcance ambiguo
- commits masivos y opacos
- push de trabajo no revisable
- PRs con varias iniciativas mezcladas
- cambios funcionales sin tests
- cambios estructurales sin documentación
- trabajo en `main` sin control
- mensajes de commit vacíos o genéricos
- historial imposible de entender
- merges de trabajo que no cumple done

---

## Preguntas obligatorias antes de push

Antes de hacer push, debe poder responderse:

- ¿esta rama tiene un foco claro?
- ¿los commits son legibles?
- ¿el cambio está ordenado?
- ¿hay archivos no relacionados incluidos?
- ¿faltan tests?
- ¿falta documentación?
- ¿el push ayuda a revisión o solo sube ruido?

Si alguna respuesta crítica falla, no debería hacerse push todavía.

---

## Preguntas obligatorias antes de merge

Antes de mergear, debe poder responderse:

- ¿el PR tiene alcance cerrado?
- ¿respeta arquitectura y límites modulares?
- ¿tiene tests cuando aplican?
- ¿tiene documentación cuando aplica?
- ¿trata tenancy y permisos cuando corresponde?
- ¿evita deuda oculta?
- ¿cumple definition of done?

Si alguna respuesta crítica es no, no debe mergearse.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/migration-policy.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/checklists/pr-checklist.md`

---

## Estado de esta especificación

Este documento define el workflow oficial de Git y GitHub para ChefOS v3.

Todo cambio futuro del proyecto debe ser compatible con estas reglas de rama, commit, push, PR, revisión y merge.
