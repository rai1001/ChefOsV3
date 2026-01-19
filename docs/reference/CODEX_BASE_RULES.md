# Reglas base de everything-codex-code (resumen aplicable)

Este resumen condensa las guías de `everything-codex-code` que usaremos como referencia operativa sin reemplazar las reglas raíz del repo (`.cursorrules`, `CONVENTIONS.md`, `SPRINT.md`).

## Agentes y flujo de trabajo
- Planificar antes de implementar (planner/architect), definir tests (tdd-guide/e2e-runner), implementar, luego revisión (code-reviewer/security-reviewer) y docs (doc-updater).
- Cada agente necesita objetivo, alcance, restricciones y criterios de éxito.

## Definition of Done (DoD)
- Lint + typecheck.
- Tests unit/integration + e2e con cobertura ≥90%.
- `supabase test db` y seeds idempotentes.
- RLS revisada (políticas + tests).
- Docs y checklist de PR actualizados.
- ADR si hay decisiones nuevas relevantes.

## Testing
- Mezclar unit/integration/e2e; contract tests cuando haya APIs/RPCs.
- Datos de prueba claros (fixtures/minimum seeds), mocks solo donde sea seguro.
- Métricas: cobertura global ≥90%, ramas ≥80% (si bajan, justificar).

## Arquitectura y patrones
- Clean/Hex modular; contratos explícitos (DTO/RPC) y ADR para cambios de arquitectura.
- Versiones LTS/últimas estables; evitar dependencias legacy.

## Estilo de código
- Tipado estricto, funciones pequeñas, sin logs crudos en prod, manejo de errores coherente.
- Mantener consistencia de naming, estructura de carpetas y slices verticales.

## Seguridad
- Manejo seguro de secretos; no exponer claves privilegiadas.
- Validación y saneo de inputs; authz por rol/org en cada operación.
- Revisar endpoints públicos y subir hallazgos a PR.

## Dependencias y supply chain
- Lockfiles obligatorios; revisar vulnerabilidades/licencias.
- Upgrades controlados con notas; SBOM CycloneDX disponible en plantillas.
- Plantillas opcionales: Release Please, pre-commit, renovate, CI ready en `project/infra/*/_copy_to_root`.

## Checklists (commands/)
- `dod-check`, `test-coverage`, `e2e`, `plan`, `code-review`, `refactor-clean`, `dependency-updates`, `openapi-setup`, `supply-chain-setup`, `update-docs`.

## Skills de apoyo
- `backend-patterns`, `frontend-patterns`, `coding-standards`, `tdd-workflow`, `security-review` para patrones y revisiones especializadas.
