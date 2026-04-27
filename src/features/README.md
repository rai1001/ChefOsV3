# src/features/

Módulos de negocio oficiales de ChefOS v3.

Cada módulo tiene ownership único, contrato público (`index.ts`) y estructura proporcional a su complejidad (`domain/`, `application/`, `infrastructure/`, `ui/`).

Módulos oficiales (ver `.ai/specs/module-list.md`):

- `identity` — auth, memberships, roles, perfiles UX
- `commercial` — eventos, clientes, BEO, calendario
- `recipes` — recetas, escandallo, menús
- `catalog` — productos, proveedores, ofertas
- `procurement` — PR/PO/GR, OCR albaranes
- `inventory` — lotes FIFO, reservations, counts, waste
- `production` — órdenes de producción, escalado, viabilidad y consumo FIFO
- `reporting` — KPIs, dashboard, alerts
- `compliance` — APPCC, temperaturas, etiquetado
- `automation` — jobs queue + worker
- `notifications` — in-app Realtime + email
- `integrations` — PMS (Mews/OPERA) + POS (Lightspeed/Simphony)
- `hr` — personnel, shifts, schedules
- `agents` — agentes asistidos

**Regla crítica**: ningún módulo importa de internals (`domain/`, `application/`, `infrastructure/`) de otro. Solo vía contrato público. Ver `.ai/specs/core-constraints.md § 7`.
