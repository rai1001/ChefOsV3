# ChefOS v3 Permissions Matrix

## Objetivo

Este documento define la matriz oficial de permisos por rol para ChefOS v3.

Su propósito es evitar:

- permisos asumidos implícitamente en código
- divergencia entre policies RLS y guards de UI
- operaciones sensibles accesibles a roles operativos
- ampliación de permisos sin decisión explícita

Este documento es normativo.

---

## Principios

1. Los permisos viven aquí, no en el código disperso.
2. UI y RLS aplican la misma matriz.
3. Cambiar un permiso requiere ADR.
4. Las operaciones admin-only están explícitamente marcadas.
5. Las operaciones service-only solo corren desde Edge Functions con service_role.

---

## Roles oficiales

Ver `specs/core-constraints.md` para lista completa. Resumen:

| Rol | Perfil UX | Scope principal |
|---|---|---|
| `superadmin` | oficina | cross-tenant, soporte |
| `direction` | oficina | dirección del grupo |
| `admin` | oficina | admin del hotel |
| `head_chef` | cocina | jefe de cocina (puede aprobar compras) |
| `sous_chef` | cocina | segundo chef |
| `cook` | cocina | cocinero |
| `commercial` | comercial | vende eventos |
| `procurement` | compras | compras |
| `warehouse` | compras | recepción / almacén |
| `room` | comercial | sala / servicio |
| `reception` | comercial | recepción |
| `operations` | comercial | operaciones |
| `maintenance` | cocina | mantenimiento |

---

## Matriz general (MVP + operaciones del día a día)

Leyenda: ✅ puede · ⚠️ solo lectura · ❌ denegado

### Identity & admin

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Ver dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cambiar de hotel activo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Administrar roles / invitar usuarios | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crear/editar hotel (onboarding) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Eventos / Comercial

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| CRUD eventos | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| Confirmar / cerrar evento | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Generar BEO PDF | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ |

### Recetas / Menús

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| CRUD recetas | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Aprobar receta (state machine) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CRUD menús | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ |

### Catálogo (Productos / Proveedores)

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| CRUD productos | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ |
| CRUD proveedores | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ | ❌ |
| CRUD ofertas / alias | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Compras (Procurement)

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Crear PR (purchase request) | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ⚠️ |
| Aprobar PR / generar PO | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Enviar PO a proveedor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Recibir mercancía (GR) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Subir foto albarán (OCR) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Revisar OCR (ocr-review) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### Inventario

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Ver inventario | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Ajustes manuales de stock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Registrar merma | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Conteos ciegos (stock_counts) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reservar stock para evento | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| Forensics (get_stock_forensics) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Warehouse

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Ver stock por almacén | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear almacén | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Editar almacén | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Definir almacén default | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Archivar almacén | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Transferir stock entre almacenes | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### Producción

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Ver órdenes de producción | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Crear órdenes de producción | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Comprobar viabilidad de stock | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Iniciar producción (consume FIFO) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Completar producción | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cancelar producción | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Compliance (APPCC / Etiquetado / Trazabilidad)

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Registrar APPCC | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Log temperaturas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Crear etiqueta | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Trace lot (auditoría) | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ |

### Reporting / Alerts / Dashboard

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Ver KPIs dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver alertas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dismissear alerta | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Food cost por evento / servicio | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ |
| Cost variance report | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Automation / Notifications

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| Ver jobs queue | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configurar automatizaciones | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Recibir notificaciones in-app | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark all as read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Preferencias de notificación | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### HR

| Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
|---|---|---|---|---|---|---|---|---|---|
| CRUD personnel | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CRUD shifts / schedule rules | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generar schedule mensual | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver mi horario | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Integraciones PMS / POS (post-Codex audit)

| Operación | superadmin | direction | admin | resto |
|---|---|---|---|---|
| Listar integraciones (metadata vía `get_pms/pos_integrations`) | ✅ | ✅ | ✅ | ✅ |
| Leer credentials directo (tabla raw) | ✅ | ✅ | ✅ | ❌ |
| Crear / actualizar / deshabilitar integración | ✅ | ✅ | ✅ | ❌ |
| Borrar integración | ✅ | ✅ | ❌ | ❌ |
| `trigger_pms_sync` (test / occupancy / reservations) | ✅ | ✅ | ✅ | ❌ |
| `trigger_pos_sync` (test / sync_sales) | ✅ | ✅ | ✅ | ❌ |
| `trigger_pos_sync` (push_kitchen_orders — escritura externa) | ✅ | ✅ | ❌ | ❌ |
| `get_integration_sync_logs` (payloads + errors) | ✅ | ✅ | ✅ | ❌ |

### Defense in depth (migración `00029`)

- `sync_type` debe estar en whitelist (errcode P0003 si no)
- `config.<sync_type>` debe ser `true` antes de encolar

---

## Agentes M15 (post-Codex audit)

| Operación | service_role | authenticated |
|---|---|---|
| `run_*_agent` (10 funciones service-only) | ✅ | ❌ (REVOKE EXECUTE) |
| `_create_agent_suggestion` (helper interno) | ✅ | ❌ |
| `run_all_automejora_agents` (worker utility) | ✅ | ❌ |
| `get_agent_suggestions` / `approve_suggestion` / `reject_suggestion` | — | ✅ (con `check_membership`) |
| `get_agent_configs` / `upsert_agent_config` | — | ✅ (gating UI hasta role check) |

---

## Aplicación dual: UI + RLS

Cada celda de la matriz debe estar aplicada **en dos sitios**:

1. **UI guard** en el hook de `application/` o en el componente (deshabilitar/ocultar).
2. **Policy RLS** o `check_membership` en la RPC (denegar server-side).

La UI guard mejora UX (el usuario no ve opciones imposibles). La RLS protege contra bypass del cliente. Ambas son obligatorias — no una u otra.

---

## Ampliación de la matriz

Añadir una operación o rol nuevo requiere:

1. Añadir fila/columna en la tabla correspondiente.
2. Actualizar policies RLS o RPCs afectadas.
3. Actualizar hooks `application/` del módulo.
4. Añadir tests que validan autorizado + denegado.
5. Registrar en `decisions-log.md` si cambia el modelo de roles.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/core-constraints.md`
- `/.ai/specs/database-security.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/decisions-log.md`
- `/.ai/checklists/module-checklist.md`

---

## Estado de esta especificación

Este documento define la matriz oficial de permisos de ChefOS v3.

Toda policy RLS y todo guard de UI debe cumplirla.
