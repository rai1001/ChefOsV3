# ChefOS v3 Sprint 00 - Foundation

## Objetivo del sprint

Formalizar la base operativa del proyecto dentro de `.ai/` y dejar definido el marco oficial para construir ChefOS v3 con orden estricto, arquitectura estable, documentación controlada y ejecución por sprints cerrados.

Este sprint no existe para desarrollar features de negocio.

Existe para cerrar la fundación documental, operativa y de workflow del proyecto.

---

## Estado del sprint

- Código de negocio: fuera de alcance
- Reorganización masiva del repo: fuera de alcance
- Migración de legacy: fuera de alcance
- Implementación funcional de módulos: fuera de alcance
- Base normativa, documental y operativa del proyecto: dentro de alcance

---

## Resultado esperado

Al cerrar este sprint, el repositorio debe tener una base oficial en `.ai/` que permita:

- trabajar por sprints pequeños
- revisar cambios con criterio uniforme
- construir módulos con estructura estable
- migrar legacy con control
- validar trabajo contra definition of done
- documentar cambios estructurales con criterio
- versionar cambios con reglas claras de branch, commit, push, PR y merge
- evitar improvisación arquitectónica

---

## Alcance del sprint

Este sprint cubre exclusivamente la fundación operativa del proyecto.

### Incluye

- manifiesto base de `.ai/`
- workflow oficial del proyecto
- specs normativas base
- standards de documentación
- workflow oficial de Git y GitHub
- checklists operativas base
- prompts operativos base
- definición del sprint fundacional
- preparación del terreno para sprint 01

### No incluye

- implementación de features de negocio
- rediseño del stack
- reescritura de módulos existentes
- migración de código legacy
- cambios amplios en `src/`
- cambios amplios en `supabase/`
- automatización avanzada de skills por módulo

---

## Módulos afectados

Sprint transversal de fundación.

No debe modificar lógica específica de módulos de negocio.

Puede referenciar módulos oficiales del sistema, pero no implementar cambios funcionales sobre ellos.

---

## Dependencias del sprint

Este sprint depende únicamente de decisiones ya confirmadas del proyecto:

- stack oficial congelado
- arquitectura oficial definida
- workflow oficial definido
- política de migración definida
- standards de código y testing definidos
- standards de documentación definidos
- workflow de Git y GitHub definido
- definition of done definida

---

## Entregables del sprint

Los entregables esperados de Sprint 00 son:

### 1. Base de `.ai/`

- `.ai/README.md`
- `.ai/WORKFLOW.md`

### 2. Specs normativas

- `.ai/specs/architecture.md`
- `.ai/specs/coding-standards.md`
- `.ai/specs/testing-standards.md`
- `.ai/specs/migration-policy.md`
- `.ai/specs/definition-of-done.md`
- `.ai/specs/module-template.md`
- `.ai/specs/documentation-standards.md`
- `.ai/specs/git-workflow.md`

### 3. Checklists operativas

- `.ai/checklists/module-checklist.md`
- `.ai/checklists/pr-checklist.md`
- `.ai/checklists/migration-checklist.md`

### 4. Prompts operativos

- `.ai/prompts/module-build.prompt.md`
- `.ai/prompts/migration.prompt.md`
- `.ai/prompts/review.prompt.md`

### 5. Planificación inicial

- `.ai/sprints/sprint-00-foundation.md`
- preparación del siguiente sprint oficial del proyecto

---

## Criterios de cierre del sprint

Sprint 00 solo se considera cerrado cuando:

1. La estructura base de `.ai/` existe.
2. Los documentos normativos base están creados.
3. Los standards de documentación están formalizados.
4. El workflow de Git y GitHub está formalizado.
5. Los documentos son coherentes entre sí.
6. El workflow es compatible con arquitectura, testing, migración, documentación, Git y done.
7. Las checklists aterrizan correctamente las specs.
8. Los prompts son reutilizables y respetan el workflow oficial.
9. El sprint 00 queda definido como sprint de fundación y no como sprint funcional.
10. El siguiente sprint puede arrancar sobre una base ordenada.

---

## Tareas del sprint

### Tarea 00.01 - Crear manifiesto base de `.ai/`

- **Objetivo:** declarar propósito de `.ai/`, fijar stack, arquitectura, reglas y estructura interna esperada
- **Salida:** `.ai/README.md`

### Tarea 00.02 - Definir workflow oficial

- **Objetivo:** establecer secuencia obligatoria de trabajo, evitar mezcla de tareas, improvisación y expansión lateral
- **Salida:** `.ai/WORKFLOW.md`

### Tarea 00.03 - Formalizar arquitectura oficial

- **Objetivo:** fijar estructura del repo, fijar responsabilidad de capas, fijar límites entre módulos
- **Salida:** `.ai/specs/architecture.md`

### Tarea 00.04 - Formalizar estándares de código

- **Objetivo:** fijar reglas de tipado, ubicación, naming, modularidad y calidad de implementación
- **Salida:** `.ai/specs/coding-standards.md`

### Tarea 00.05 - Formalizar estándares de testing

- **Objetivo:** fijar reglas de validación por riesgo, establecer expectativas de unit, integration y e2e
- **Salida:** `.ai/specs/testing-standards.md`

### Tarea 00.06 - Formalizar política de migración

- **Objetivo:** impedir reutilización caótica de legacy, exigir clasificación, destino, contrato y tests
- **Salida:** `.ai/specs/migration-policy.md`

### Tarea 00.07 - Formalizar definition of done

- **Objetivo:** impedir cierres ambiguos o parciales, fijar criterio verificable de cierre
- **Salida:** `.ai/specs/definition-of-done.md`

### Tarea 00.08 - Formalizar plantilla oficial de módulo

- **Objetivo:** unificar la forma de construir módulos, reforzar ownership, contratos y encapsulación
- **Salida:** `.ai/specs/module-template.md`

### Tarea 00.09 - Formalizar estándares de documentación

- **Objetivo:** impedir documentación dispersa o implícita, exigir actualización documental cuando el cambio lo requiera
- **Salida:** `.ai/specs/documentation-standards.md`

### Tarea 00.10 - Formalizar workflow oficial de Git y GitHub

- **Objetivo:** ordenar branch, commit, push, PR y merge; impedir integración caótica de cambios
- **Salida:** `.ai/specs/git-workflow.md`

### Tarea 00.11 - Crear checklist de módulo

- **Objetivo:** revisar módulos con criterio operativo uniforme
- **Salida:** `.ai/checklists/module-checklist.md`

### Tarea 00.12 - Crear checklist de PR

- **Objetivo:** revisar PRs con estructura clara y verificable
- **Salida:** `.ai/checklists/pr-checklist.md`

### Tarea 00.13 - Crear checklist de migración

- **Objetivo:** revisar migraciones de legacy con control estricto
- **Salida:** `.ai/checklists/migration-checklist.md`

### Tarea 00.14 - Crear prompt de construcción de módulo

- **Objetivo:** permitir ejecución asistida de tareas cerradas dentro de módulos
- **Salida:** `.ai/prompts/module-build.prompt.md`

### Tarea 00.15 - Crear prompt de migración

- **Objetivo:** permitir análisis y migración estricta de piezas legacy
- **Salida:** `.ai/prompts/migration.prompt.md`

### Tarea 00.16 - Crear prompt de revisión

- **Objetivo:** permitir revisión técnica estructurada con criterio uniforme
- **Salida:** `.ai/prompts/review.prompt.md`

### Tarea 00.17 - Definir el sprint fundacional

- **Objetivo:** dejar explícito el alcance y criterio de cierre de la fase base
- **Salida:** `.ai/sprints/sprint-00-foundation.md`

---

## Riesgos del sprint

### Riesgo 1. Convertir el sprint en documentación vaga

- **Mitigación:** cada documento debe ser operativo y servir para ejecutar, revisar o cerrar trabajo real.

### Riesgo 2. Mezclar foundation con implementación de producto

- **Mitigación:** mantener fuera de alcance cualquier feature de negocio, no tocar módulos salvo como referencia normativa.

### Riesgo 3. Crear una base demasiado abstracta

- **Mitigación:** priorizar reglas concretas, checklists verificables y prompts reutilizables.

### Riesgo 4. Cerrar el sprint sin coherencia entre documentos

- **Mitigación:** revisar consistencia entre workflow, specs, checklists y prompts.

### Riesgo 5. Dejar fuera documentación y Git del sistema operativo del proyecto

- **Mitigación:** tratar documentación y versionado como parte de la fundación, no como anexos posteriores.

---

## Validación del sprint

Antes de cerrar Sprint 00, debe poder responderse:

- ¿existe una base oficial clara en `.ai/`?
- ¿las reglas del proyecto están escritas y son utilizables?
- ¿el workflow evita mezcla de tareas?
- ¿la arquitectura está formalizada?
- ¿la política de migración bloquea el copy-paste de legacy?
- ¿hay standards de documentación claros?
- ¿hay reglas claras de branch, commit, push, PR y merge?
- ¿hay checklists reales para módulos, PRs y migraciones?
- ¿hay prompts reutilizables alineados con el proyecto?
- ¿está el terreno listo para arrancar Sprint 01 con orden?

Si alguna respuesta crítica es no, Sprint 00 no está cerrado.

---

## Definition of Done del sprint

Sprint 00 está done solo cuando:

- todos los archivos base previstos para foundation existen
- el contenido es coherente con las decisiones del proyecto
- no se mezclaron features de negocio
- no se abrió arquitectura nueva
- la base creada permite ejecutar el siguiente sprint con control real
- el sprint tiene salida concreta, verificable y reusable

---

## Siguiente sprint previsto

El siguiente sprint oficial después de este es:

- `sprint-01-identity`

Ese sprint debe arrancar ya sobre esta base fundacional, no sobre contexto disperso.

---

## Estado de este documento

Este archivo define el Sprint 00 oficial de ChefOS v3.

Su función es cerrar la fase de fundación operativa del proyecto dentro del repositorio.
