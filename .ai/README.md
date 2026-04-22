# ChefOS v3 AI Operating System

## Propósito

Esta carpeta `.ai/` es el sistema operativo interno del proyecto ChefOS v3.

Su función es convertir decisiones dispersas en una base oficial, versionada y mantenible para trabajar con orden estricto dentro del repo.

Aquí se define cómo se construye, revisa, migra, prueba, documenta, versiona y planifica el proyecto.

---

## Estado del proyecto

ChefOS v3 ya no se considera un MVP improvisado.

El objetivo del proyecto es una versión estable, vendible y mantenible para cocina y hostelería, orientada a:

- hoteles
- catering
- eventos
- operaciones de backoffice

---

## Repositorio oficial

- GitHub: `rai1001/ChefOsv3` (pendiente crear al bootstrap; heredar template `rai1001/ChefOsv2` como referencia de v2)
- Supabase compartido con v2 durante construcción: `dbtrgnyfmzqsrcoadcrs` (ver `specs/decisions-log.md` ADR-0003)

---

## Stack oficial confirmado

No se permite reabrir estas decisiones salvo decisión explícita del proyecto.

- Next.js
- React
- TypeScript strict
- Supabase
- PostgreSQL
- RLS
- RPCs
- Edge Functions
- TanStack Query
- React Hook Form
- Zod
- Vitest
- Playwright

---

## Principios no negociables

1. No se rehace el stack.
2. No se construye encima del caos sin control.
3. Se trabaja con arquitectura modular estable.
4. Se trabaja por sprints pequeños y cerrados.
5. `.ai/` es la base documental operativa del proyecto.
6. Toda implementación debe respetar reglas de arquitectura, testing, migración, documentación, workflow de Git y definición de done.
7. El código legacy solo puede reutilizarse si antes se clasifica y se migra con control.
8. No se permite copiar y pegar código viejo sin refactor, destino claro y tests.
9. Los agentes son asistidos, no autónomos.
10. Multi-tenant, permisos y límites de módulo son obligatorios.

---

## Arquitectura oficial del repositorio

La estructura oficial objetivo del proyecto es:

- `src/app/` para routing, layout y composición de páginas
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` para unit, integration y e2e
- `.ai/` para specs, sprints, prompts, checklists y skills

---

## Módulos oficiales del sistema

- identity
- commercial
- recipes
- catalog
- procurement
- inventory
- production
- reporting
- compliance
- automation
- notifications
- integrations
- hr
- agents

---

## Reglas de trabajo

### Reglas generales

- No inventar arquitectura nueva.
- No tocar módulos no relacionados.
- No mezclar varias tareas en una sola implementación.
- No copiar código legacy sin clasificarlo primero.
- No cruzar límites entre módulos sin contrato público.
- No meter lógica de negocio en páginas o componentes compartidos.
- Todo cambio debe incluir tests cuando aplique.
- Todo avance debe ejecutarse por sprints pequeños.
- Todo cambio debe pasar por revisión estructurada.
- Todo cambio debe dejar documentación actualizada cuando aplique.
- Todo cambio debe seguir un flujo claro de branch, commit, push, PR y merge.

### Regla operativa principal

Cada cambio debe poder responder con claridad:

- qué módulo toca
- qué contrato modifica
- qué archivo crea o cambia
- qué test valida el cambio
- qué criterio de done cumple

---

## Estructura interna esperada de `.ai/`

```txt
.ai/
  README.md
  WORKFLOW.md
  specs/
  sprints/
  prompts/
  checklists/
  skills/
```

## Contenido objetivo de `.ai/`

### `specs/` (19 documentos normativos)

**Base operativa** (formato y proceso):
- `architecture.md` — estructura oficial del repo y reglas de capas
- `coding-standards.md` — TypeScript strict, naming, modularidad
- `testing-standards.md` — estrategia de tests, cobertura ≥90% en domain/application
- `migration-policy.md` — clasificación y migración de legacy
- `documentation-standards.md` — qué se documenta y dónde
- `git-workflow.md` — branch, commit, PR, release
- `definition-of-done.md` — 11 condiciones mínimas
- `module-template.md` — plantilla oficial de módulo

**Reglas del agente y ejecución**:
- `agent-responsibilities.md` — cómo se comporta el agente (AI/humano asistido)
- `task-execution-order.md` — orden oficial de tareas + scripts obligatorios + anti-deriva
- `ci-standards.md` — checks obligatorios de CI y bloqueo de merge
- `decisions-log.md` — ADR-lite para decisiones estructurales

**Reglas del dominio**:
- `core-constraints.md` — reglas duras (multi-tenant, RLS, módulos no se llaman entre sí)
- `database-security.md` — RLS helpers, SECURITY DEFINER checklist, credentials isolation
- `permissions-matrix.md` — matriz roles × acciones (UI guard + RLS)
- `domain-events.md` — contrato canónico + 20+ eventos oficiales
- `module-list.md` — 14 módulos oficiales + estructura mínima
- `error-messages-enum.md` — catálogo de mensajes UI
- `design-tokens.md` — Industrial Control Surface (fuentes, colores, WCAG AA)

### `sprints/` (15 etapas ejecutables)

Planificación cerrada con detalle del dominio absorbido de v2:

- `sprint-00-foundation.md` — base documental + scaffolding técnico
- `sprint-01-identity.md` — auth + memberships + roles + UX profile
- `sprint-02-commercial.md` — eventos, clientes, BEO, calendario
- `sprint-03-recipes.md` — recetas, escandallo, menús, costeo recursivo
- `sprint-04-catalog.md` — productos, proveedores, ofertas, alias
- `sprint-05-procurement.md` — PR/PO/GR, consolidación, OCR albaranes
- `sprint-06-inventory.md` — FIFO, reservations, counts, waste, forensics
- `sprint-07-production.md` — workflows, mise en place, KDS, kanban
- `sprint-08-reporting.md` — KPIs, dashboard, alerts, food cost, variance
- `sprint-09-compliance.md` — APPCC, temperaturas, etiquetado, trazabilidad
- `sprint-10-automation.md` — jobs queue + worker
- `sprint-11-notifications.md` — in-app Realtime + email dispatcher
- `sprint-12-integrations.md` — PMS (Mews/OPERA) + POS (Lightspeed/Simphony)
- `sprint-13-hr.md` — personnel, shifts, schedules
- `sprint-14-agents.md` — 10 agentes automejora + 5 coordinación evento

Cada sprint incluye: objetivo, alcance cerrado, contratos públicos esperados, entidades de dominio, casos de uso, RPCs/Edge Functions consumidas, state machines, eventos emitidos/consumidos, tests mínimos, criterio de done específico.

### `prompts/` (7 prompts operativos)

- `module-build.prompt.md` — construir módulo siguiendo module-template
- `migration.prompt.md` — migrar legacy con clasificación
- `review.prompt.md` — revisor técnico estricto
- `design-cookbook.prompt.md` — recetas copy-paste para UI (tablas, KPIs, modales, status variants)
- `stitch-screen-mapping.prompt.md` — mapeo ChefOS → patrón Stitch
- `stitch-ui-reference.prompt.md` — cómo consumir HTMLs de Stitch
- `ci-workflow-setup.prompt.md` — template YAML CI + secrets + branch protection

### `checklists/` (5 checklists)

- `module-checklist.md` — validación de módulos
- `pr-checklist.md` — validación de PRs (11 secciones)
- `migration-checklist.md` — validación de migraciones
- `ui-design-checklist.md` — por pantalla (responsive, loading, empty, error, a11y WCAG AA)
- `release-runbook.md` — pre-release + env vars + webhooks + smoke test + rollback

### `skills/` (21 skills)

**Transversales**:
- `chefos-v3-architect/` — validación arquitectónica
- `chefos-v3-sprint-builder/` — construcción de sprints
- `chefos-v3-migrate-legacy/` — migración legacy de v2

**Por módulo** (14): `identity`, `commercial`, `recipes`, `catalog`, `procurement`, `inventory`, `production`, `reporting`, `compliance`, `automation`, `notifications`, `integrations`, `hr`, `agents`.

**Operativas**:
- `demo-chefos-playbook/` — guion demo 40 min + plan B + objeciones + cierre
- `design-system-rollout/` — plan 5 fases de aplicación del DS a todas las pantallas
- `ocr-delivery-notes-workflow/` — flujo OCR albaranes (foto → Claude Vision → GR lines)
- `production-module-improvements/` — 10 mejoras priorizadas MVP 1/2/3 para sprint-07

---

## Cómo se debe trabajar a partir de esta base

1. Primero se define la norma.
2. Luego se define el flujo.
3. Luego se definen specs y checklists.
4. Después se baja a sprints.
5. Solo después se implementa o se migra código.

---

## Prioridad inmediata

La prioridad inmediata del proyecto es convertir el contexto disperso actual en una base ordenada dentro del repo.

Eso implica:

- formalizar arquitectura
- formalizar workflow
- formalizar standards
- formalizar política de migración
- formalizar definición de done
- formalizar estándares de documentación
- formalizar workflow de Git y GitHub
- organizar sprints iniciales

---

## Estado de este documento

Este archivo es la entrada principal de `.ai/`.

Su función es servir como contrato base del proyecto para cualquier trabajo posterior dentro del repositorio.
