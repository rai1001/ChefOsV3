# CLAUDE.md — ChefOS v3

## Contexto del proyecto

ChefOS v3 es la reescritura DDD del dominio validado en ChefOS v2 (producción Eurostars, 52 migraciones, demo Iago). Objetivo: versión estable, vendible y mantenible para cocina y hostelería orientada a hoteles, catering, eventos y backoffice.

- **Stack** (ADR-0001): Next 16 · React 19 · TS5 strict · Supabase · Tailwind 4 · Radix UI · TanStack Query 5 · RHF + Zod · Vitest + Playwright.
- **Repo**: `rai1001/ChefOsv3` (pendiente crear).
- **Supabase**: `dbtrgnyfmzqsrcoadcrs` (compartido con v2 — ADR-0003).
- **Arquitectura**: modular por `src/features/<module>/` con frontera pública vía `index.ts`.

## Reglas globales (del usuario)

- Responder SIEMPRE en español.
- Tono directo, sin rodeos, sin emojis innecesarios.
- No añadir dependencias sin preguntar.
- No añadir features no pedidas.
- Ir directo al código, sin preámbulos.

## Antes de tocar código

Consultar y respetar en este orden:

1. `.ai/README.md` — contrato base del proyecto.
2. `.ai/WORKFLOW.md` — secuencia oficial de trabajo.
3. `.ai/specs/architecture.md` — capas y ownership.
4. `.ai/specs/coding-standards.md` — TypeScript, naming, modularidad.
5. `.ai/specs/core-constraints.md` — reglas duras (multi-tenant, RLS, módulos no se llaman entre sí).
6. `.ai/specs/git-workflow.md` — branch, commit, PR, merge.
7. `.ai/specs/definition-of-done.md` — condiciones de cierre.
8. El `sprint-XX-*.md` del sprint activo.

## Antes de hacer push / PR

- `.ai/checklists/pr-checklist.md` debe pasarse entero.
- Documentación actualizada cuando aplique.
- Tests mínimos presentes cuando aplique.
- Sin mezclar alcance lateral en el mismo PR.

## Cuando la tarea sea ambigua

1. Identificar módulo afectado (`.ai/specs/module-list.md`).
2. Confirmar contrato público involucrado.
3. Evaluar impacto en datos, permisos, tenancy.
4. Proponer plan antes de escribir código.
5. Pedir confirmación si el alcance puede crecer.

## Prohibiciones duras (no negociables)

- Lógica de negocio en `src/app/` o `src/components/`.
- Acceso directo a Supabase desde componentes (usar hooks de `application/`).
- Importar internals (`domain/`, `application/`, `infrastructure/`) de otro módulo.
- Crear tabla de negocio sin `hotel_id` / `tenant_id`.
- RPC SECURITY DEFINER sin `check_membership()` en la primera línea.
- `// @ts-ignore` sin comentario + ADR si afecta contrato público.
- `--no-verify` en commits salvo hotfix documentado.
- Saltarse tests / coverage thresholds.
- Añadir dependencia UI fuera del set ADR-0005 sin ADR-0005-extensión.

## Sprint actual

- **sprint-00b-scaffolding** (este sprint, el que dejó listo el repo).
- Siguiente: **sprint-01-identity** (auth + memberships + roles + UX profile).

Trabajar siempre dentro del alcance del sprint abierto. Si una tarea excede el alcance, proponer ADR en `.ai/specs/decisions-log.md` antes de actuar.

## Memoria del agente

El sistema de memoria persistente vive en `C:\Users\Israel\.claude\projects\C--APLICACIONES-ChefOsv3\memory\`. Consultar al inicio de sesión y actualizar al final.

Bóveda Obsidian: `C:\Users\Israel\Documents\Rai-claude2`. Registro de seguimiento en `05-Claude/Configuración/Claude - Registro de Seguimiento.md`.

## Estado de este documento

Este CLAUDE.md es la instrucción base para trabajo asistido sobre ChefOS v3. Debe mantenerse coherente con `.ai/`.
