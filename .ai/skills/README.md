# ChefOS v3 Skills

## Objetivo

Esta carpeta contiene las skills internas oficiales del proyecto ChefOS v3.

Su propósito es encapsular instrucciones operativas reutilizables para trabajo asistido dentro del repositorio, siempre bajo control humano y respetando la arquitectura oficial, el workflow, la documentación, el flujo de Git y los límites del proyecto.

Las skills de ChefOS v3 no sustituyen criterio técnico, revisión ni ownership de módulo.

Existen para asistir tareas concretas, repetibles y bien delimitadas.

---

## Principios de uso

1. Las skills son asistidas, no autónomas.
2. Ninguna skill puede romper la arquitectura oficial del proyecto.
3. Ninguna skill puede rehacer el stack.
4. Ninguna skill puede mezclar varias tareas sin alcance cerrado.
5. Ninguna skill puede tocar módulos no relacionados sin justificación explícita.
6. Ninguna skill puede reutilizar legacy sin clasificación previa.
7. Ninguna skill puede copiar código viejo sin refactor, destino claro y validación.
8. Ninguna skill puede ignorar multi-tenant, permisos o límites de módulo cuando aplican.
9. Ninguna skill puede marcar trabajo como cerrado sin contrastarlo con definition of done.
10. Toda skill debe producir salida revisable, concreta y verificable.
11. Toda skill debe dejar trazabilidad suficiente para documentación y Git cuando aplique.

---

## Relación con `.ai/`

Las skills deben operar siempre alineadas con estos documentos base:

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
- `.ai/checklists/module-checklist.md`
- `.ai/checklists/pr-checklist.md`
- `.ai/checklists/migration-checklist.md`

Ninguna skill puede contradecir estos documentos.

---

## Qué puede hacer una skill

Una skill interna de ChefOS v3 sí puede:

- ayudar a delimitar una tarea cerrada
- traducir una tarea en contratos, archivos, tests y documentación
- revisar si un cambio respeta arquitectura y workflow
- guiar migraciones de legacy con clasificación y destino claro
- ayudar a construir sprints pequeños y cerrados
- ayudar a revisar módulos, PRs o cambios concretos
- acelerar trabajo repetible sin romper disciplina del proyecto

---

## Qué no puede hacer una skill

Una skill interna de ChefOS v3 no puede:

- inventar arquitectura nueva
- rehacer el repo por impulso
- abrir rediseños globales sin autorización explícita
- mezclar varios objetivos en una sola ejecución
- decidir por sí sola cambios estructurales mayores
- tocar múltiples módulos por conveniencia
- aprobar cambios sin evidencia suficiente
- dar por válida una migración solo porque el código ya existía
- asumir permisos o tenancy sin declararlos
- actuar como sustituto de revisión técnica
- ocultar deuda o saltarse documentación y Git workflow

---

## Estructura oficial de una skill

Cada skill debe tener su propia carpeta dentro de `.ai/skills/`.

Cada skill del proyecto debe incluir como mínimo:

- `README.md`
- `SKILL.md`

### Responsabilidad de cada archivo

#### `README.md`

Sirve como documento humano de referencia del proyecto para explicar:

- objetivo
- alcance
- ownership
- casos de uso válidos
- casos de uso no válidos
- reglas del dominio
- ejemplos de uso

#### `SKILL.md`

Es la definición operativa real de la skill.

Debe contener:

- frontmatter con `name` y `description`
- instrucciones de ejecución
- reglas obligatorias
- modo de trabajo
- formato obligatorio de salida
- criterio de calidad

---

## Estructura actual esperada

```txt
.ai/skills/
  README.md

  chefos-v3-architect/
    README.md
    SKILL.md

  chefos-v3-sprint-builder/
    README.md
    SKILL.md

  chefos-v3-migrate-legacy/
    README.md
    SKILL.md

  identity/
    README.md
    SKILL.md

  commercial/
    README.md
    SKILL.md

  recipes/
    README.md
    SKILL.md

  catalog/
    README.md
    SKILL.md

  procurement/
    README.md
    SKILL.md

  inventory/
    README.md
    SKILL.md

  production/
    README.md
    SKILL.md

  reporting/
    README.md
    SKILL.md

  compliance/
    README.md
    SKILL.md

  automation/
    README.md
    SKILL.md

  notifications/
    README.md
    SKILL.md

  integrations/
    README.md
    SKILL.md

  hr/
    README.md
    SKILL.md

  agents/
    README.md
    SKILL.md

  demo-chefos-playbook/
    README.md
    SKILL.md

  design-system-rollout/
    README.md
    SKILL.md

  ocr-delivery-notes-workflow/
    README.md
    SKILL.md

  production-module-improvements/
    README.md
    SKILL.md
```

## Skills transversales oficiales

### chefos-v3-architect

Propósito:

- aterrizar tareas dentro de la arquitectura oficial del proyecto

Responsabilidad:

- validar encaje arquitectónico
- ubicar responsabilidades por capas
- reforzar límites modulares
- impedir desvíos estructurales

### chefos-v3-sprint-builder

Propósito:

- convertir objetivos difusos en sprints pequeños, cerrados y revisables

Responsabilidad:

- definir objetivo de sprint
- fijar alcance y fuera de alcance
- proponer tareas cerradas
- evitar mezcla de trabajo
- alinear sprint con definition of done

### chefos-v3-migrate-legacy

Propósito:

- clasificar y migrar piezas legacy hacia la arquitectura oficial

Responsabilidad:

- clasificar legacy
- decidir si migrar, extraer, refactorizar o descartar
- definir destino y contrato objetivo
- exigir validación, documentación y trazabilidad

## Skills oficiales por módulo

### identity

Owner de:

- sesión autenticada
- usuario actual
- tenant actual
- contexto base de acceso

### commercial

Owner de:

- entidad comercial base
- estado comercial base
- datos mínimos del dominio comercial

### recipes

Owner de:

- receta base
- composición mínima
- estructura funcional de receta

### catalog

Owner de:

- entidad catalogable base
- clasificación o visibilidad mínima
- estado base de catálogo

### procurement

Owner de:

- compra o abastecimiento base
- estado base de compra
- proveedor base cuando aplique

### inventory

Owner de:

- stock o existencia base
- disponibilidad base
- movimiento mínimo cuando aplique

### production

Owner de:

- producción base
- ejecución productiva base
- transformación operativa mínima cuando aplique

### reporting

Owner de:

- consulta base de reporting
- filtros mínimos
- salida estructurada mínima

### compliance

Owner de:

- control base de cumplimiento
- validación obligatoria mínima
- estado base de compliance

### automation

Owner de:

- regla base de automatización
- trigger mínimo
- condición mínima
- acción automática mínima

### notifications

Owner de:

- notificación base
- mensaje mínimo
- canal mínimo
- estado base de notificación

### integrations

Owner de:

- integración base
- adapter mínimo
- contrato mínimo de entrada y salida

### hr

Owner de:

- entidad base de personal
- asignación funcional mínima
- estado base de personal

### agents

Owner de:

- agente base
- configuración mínima
- ejecución asistida mínima
- control humano obligatorio

Regla crítica:

- los agentes son asistidos, no autónomos

## Skills operativas

### demo-chefos-playbook

Propósito:

- guion paso a paso para demostrar ChefOS v3 a cliente potencial

Responsabilidad:

- setup de entorno demo
- checklist pre-demo
- ejecución de guion 40 min
- plan B si algo falla
- cierre + follow-up

### design-system-rollout

Propósito:

- aplicar progresivamente el design system Industrial Control Surface a todas las pantallas

Responsabilidad:

- plan en 5 fases (F0-F5) con criterios de cierre
- checklist de regresión por pantalla
- mappings *_STATUS_VARIANT por módulo

### ocr-delivery-notes-workflow

Propósito:

- procesar albaranes de proveedor mediante OCR (Claude Vision) y actualizar stock + precios + escandallos

Responsabilidad:

- arquitectura del pipeline (Storage → enqueue job → Edge Function → Claude Vision → RPC → cascada)
- esquema JSON del OCR
- idempotencia + rate limits
- métricas de éxito

### production-module-improvements

Propósito:

- banco de mejoras priorizadas (MVP 1/2/3) para el módulo production

Responsabilidad:

- 10 mejoras documentadas (tareas vs elaboraciones, checklists, asignación por rol, dependencias, anti-abuso móvil, alertas, cierre turno, historial, UX móvil)
- input explícito para sprint-07
- decisiones registradas en decisions-log.md si se descartan

## Regla de alcance cerrado

Cada skill debe estar diseñada para un tipo de trabajo específico.

No deben existir skills con objetivos difusos como:

- “ordenar todo el proyecto”
- “mejorar cualquier cosa”
- “reorganizar el repo”
- “limpiar todo el legacy”

Las skills válidas deben responder a operaciones concretas y repetibles.

## Regla de ownership

Cada skill debe tener ownership claro sobre el tipo de ayuda que presta.

Ejemplos:

- arquitectura
- construcción de sprint
- migración controlada
- trabajo guiado por módulo

No debe haber skills solapadas sin necesidad.

## Regla de evidencia

Una skill no debe producir cierres ambiguos.

La salida de una skill debe poder traducirse en evidencia verificable como:

- archivo a crear o modificar
- contrato a definir
- checklist a pasar
- sprint a cerrar
- migración a validar
- tests requeridos
- documentación a actualizar
- rama, commit o PR esperable
- revisión aprobable o no aprobable

## Relación entre skills, documentación y Git

Toda skill debe asumir que un cambio puede requerir:

- actualización documental
- actualización de sprint
- actualización de contrato
- trazabilidad en rama
- commits legibles
- PR revisable

Ninguna skill debe tratar documentación o Git como pasos opcionales cuando realmente aplican.

## Relación con prompts

Las skills y los prompts no son lo mismo.

### Prompts

Sirven para guiar conversaciones o ejecuciones concretas.

### Skills

Sirven para encapsular comportamiento operativo reutilizable y especializado dentro del proyecto.

Ambos deben mantenerse coherentes entre sí.

## Estado de esta carpeta

Esta carpeta define la base oficial de skills internas de ChefOS v3.

Todas las skills listadas aquí deben mantenerse alineadas con la arquitectura, el workflow, los standards, la documentación, el flujo de Git y la definition of done del proyecto.
