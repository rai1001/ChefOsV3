# ChefOS v3 Domain Events

## Objetivo

Este documento define los eventos de dominio de ChefOS v3: contrato canónico, lista de eventos oficiales, convenciones de payload, reglas de emisión y consumo.

Su propósito es evitar:

- módulos que se llaman entre sí directamente (acoplamiento fuerte)
- eventos con payloads arbitrarios o no documentados
- duplicación de eventos por triggers que disparan 2×
- emisión desde capas incorrectas
- consumo sin contratos claros

Este documento es normativo.

---

## Principios

1. **Los módulos nunca se llaman directamente entre sí para lógica.** Emiten eventos → otros módulos reaccionan.
2. El payload canónico es uniforme entre todos los eventos.
3. El nombre del evento sigue convención `<dominio>.<verbo_pasado>`.
4. La emisión vive en el módulo owner del agregado.
5. El consumo vive en los módulos que reaccionan.
6. Los eventos son append-only (no se modifican retroactivamente).

---

## Payload canónico

Todos los eventos comparten la misma estructura:

```json
{
  "event_id": "uuid",
  "event_type": "string (nombre canónico)",
  "occurred_at": "ISO-8601 timestamp",
  "hotel_id": "uuid",
  "actor_user_id": "uuid | null",
  "payload": { /* específico por evento */ }
}
```

### Campos

- `event_id` — UUID v4 generado por `emit_event()`.
- `event_type` — nombre canónico (ver listado). Nunca se cambia una vez publicado.
- `occurred_at` — timestamp del momento en que ocurrió el hecho, no de la emisión.
- `hotel_id` — **obligatorio** (multi-tenant). Ningún evento es cross-tenant.
- `actor_user_id` — puede ser `null` si es sistema / trigger / worker automático.
- `payload` — objeto con los datos específicos del evento.

---

## Emisión: RPC `emit_event()`

Toda emisión pasa por la RPC canónica:

```sql
select public.emit_event(
  p_hotel_id            => ...,
  p_aggregate_type      => 'event' | 'purchase_order' | 'stock_lot' | ...,
  p_aggregate_id        => ...,
  p_event_type          => 'evento.updated',
  p_payload             => jsonb_build_object(...),
  p_actor_user_id       => auth.uid(),
  p_dedup_window_seconds => 5  -- default
);
```

### Reglas de emisión

- Solo desde triggers, RPCs SECURITY DEFINER o Edge Functions — nunca desde el cliente.
- La función está marcada service-only (REVOKE a public/anon/authenticated, GRANT a service_role). Los triggers la invocan porque corren con SECURITY DEFINER en su contexto.
- El `p_dedup_window_seconds` evita duplicados cuando dos triggers disparan el mismo evento (5s por defecto).
- Si una transacción emite varios eventos, cada uno tiene su propio `event_id`.

---

## Lista oficial de eventos

### Identity

- `membership.created` — nueva membership añadida a un hotel
- `membership.role_changed` — rol de un usuario cambió
- `membership.deactivated` — membership deshabilitada

### Commercial (Eventos)

- `evento.created` — evento nuevo creado (estado inicial: draft)
- `evento.updated` — evento modificado (pax, fecha, menú, etc.)
- `evento.confirmed` — evento pasa a confirmado → dispara planificación producción + compras
- `evento.cancelled` — evento cancelado → dispara liberación de reservations y notificaciones
- `evento.completed` — evento cerrado → dispara post-event analysis (agente post_event)

### Recipes

- `recipe.created` — receta nueva
- `recipe.updated` — receta modificada
- `recipe.approved` — receta pasa de review a approved (state machine)
- `recipe.deprecated` — receta marcada deprecated
- `recipe.cost_recalculated` — coste recursivo cambió (cascada de precios)

### Catalog

- `product.created` — producto nuevo
- `product.price_changed` — cambio de precio detectado (manual o OCR)
- `supplier.offer_updated` — oferta de proveedor actualizada

### Procurement

- `purchase_request.created` — PR creada
- `purchase_request.approved` — PR aprobada
- `purchase_request.consolidated` — PR consolidada en una PO
- `pedido.sent` — PO enviada al proveedor
- `pedido.received_partial` — GR recibido parcial (con faltantes)
- `pedido.received_complete` — GR recibido completo
- `ocr.receipt_processed` — albarán OCR procesado exitosamente
- `ocr.receipt_needs_review` — albarán OCR requiere revisión manual

### Inventory

- `inventario.lote_created` — lote nuevo (origen: pedido / producción / manual)
- `inventario.lote_expiring` — lote próximo a caducar (alerta anticipada)
- `inventario.lote_expired` — lote caducado
- `inventario.merma_recorded` — merma registrada
- `inventario.count_submitted` — conteo ciego entregado para revisión
- `inventario.count_reviewed` — conteo ciego validado por admin

### Production

- `tarea_produccion.created` — tarea de producción creada
- `tarea_produccion.updated` — cambio de estado de tarea (pendiente → en_proceso → done / blocked)
- `workflow.generated` — workflow de evento generado automáticamente
- `mise_en_place.completed` — mise en place de una tarea completada
- `kitchen_order.status_changed` — item de KDS cambió de estado

### Reporting

- `kpi.snapshot_created` — snapshot diario de KPIs generado
- `alert.raised` — alerta operacional generada (stock bajo, variance, etc.)
- `alert.dismissed` — alerta marcada como atendida

### Compliance

- `appcc.record_created` — registro APPCC creado
- `temperature.logged` — lectura de temperatura registrada
- `temperature.out_of_range` — temperatura fuera de rango crítico
- `label.created` — etiqueta generada (abierto, prep, sobra)
- `lot.traced` — consulta de trazabilidad ejecutada (audit trail)

### Automation

- `automation.job_enqueued` — job añadido a la queue
- `automation.job_started` — worker tomó el job
- `automation.job_completed` — job finalizado con éxito
- `automation.job_failed` — job falló (con backoff si reintento aplica)
- `automation.job_cancelled` — job cancelado manualmente

### Notifications

- `notification.created` — notificación in-app creada
- `notification.read` — notificación leída por el destinatario
- `notification.email_sent` — email enviado por el dispatcher

### Integrations

- `integration.sync_started` — sync PMS / POS arrancó
- `integration.sync_completed` — sync completado exitosamente
- `integration.sync_failed` — sync falló
- `proveedor.incidencia_created` — incidencia registrada (retraso, falta, sustitución, calidad)

### HR

- `personnel.created` — empleado nuevo
- `schedule.generated` — schedule mensual generado
- `shift_assignment.updated` — asignación de turno cambió

### Agents

- `agent.suggestion_created` — agente generó una sugerencia
- `agent.suggestion_approved` — sugerencia aprobada → se ejecuta acción derivada
- `agent.suggestion_rejected` — sugerencia rechazada

---

## Convenciones de naming

- **Formato**: `<dominio>.<verbo_pasado>` (español o inglés consistente por dominio)
- Dominios en ChefOS v3:
  - `membership`, `evento`, `recipe`, `product`, `supplier`, `purchase_request`, `pedido`, `inventario`, `tarea_produccion`, `workflow`, `mise_en_place`, `kitchen_order`, `kpi`, `alert`, `appcc`, `temperature`, `label`, `lot`, `automation`, `notification`, `integration`, `proveedor`, `personnel`, `schedule`, `shift_assignment`, `agent`, `ocr`
- Verbos en pasado: `created`, `updated`, `deleted`, `approved`, `cancelled`, `completed`, `sent`, `received_partial`, `received_complete`, `processed`, `expired`, etc.

---

## Ejemplos de payload

### `evento.updated`

```json
{
  "event_type": "evento.updated",
  "payload": {
    "evento_id": "uuid",
    "changes": {
      "pax": { "old": 80, "new": 120 },
      "fecha_inicio": { "old": "2026-02-01T12:00", "new": "2026-02-01T13:00" },
      "menu_id": { "old": "uuid", "new": "uuid" }
    },
    "estado": "confirmado"
  }
}
```

### `pedido.received_partial`

```json
{
  "event_type": "pedido.received_partial",
  "payload": {
    "pedido_id": "uuid",
    "faltantes": [
      { "producto_id": "uuid", "cantidad_faltante": 5, "unidad": "kg" }
    ],
    "impacta_eventos": ["uuid", "uuid"]
  }
}
```

### `inventario.lote_expiring`

```json
{
  "event_type": "inventario.lote_expiring",
  "payload": {
    "lote_id": "uuid",
    "producto_id": "uuid",
    "fecha_caducidad": "2026-01-30",
    "horas_restantes": 48
  }
}
```

### `automation.job_enqueued`

```json
{
  "event_type": "automation.job_enqueued",
  "payload": {
    "job_id": "uuid",
    "job_type": "sync_pms",
    "scheduled_at": "2026-04-21T10:00:00Z",
    "priority": "normal"
  }
}
```

---

## Consumo de eventos

### Patrón oficial

Los módulos consumidores se suscriben a eventos vía triggers en `domain_events`:

```sql
create trigger on_pedido_received_partial
after insert on public.domain_events
for each row
when (new.event_type = 'pedido.received_partial')
execute function public.handle_pedido_received_partial();
```

La función `handle_*` implementa la reacción del módulo: generar alerta, encolar job, re-planificar producción, etc.

### Matriz de consumo (resumen)

| Evento | Alertas | Automation | Notifications | Dashboard |
|---|---|---|---|---|
| `evento.updated` | ✅ | ✅ | ✅ | ✅ |
| `evento.cancelled` | ✅ | ✅ | ✅ | ✅ |
| `tarea_produccion.updated` | ✅ | ❌ | ⚠️ (si blocked) | ✅ |
| `pedido.sent` | ❌ | ❌ | ✅ | ✅ |
| `pedido.received_partial` | ✅ | ❌ | ✅ | ✅ |
| `inventario.lote_expiring` | ✅ | ❌ | ✅ | ✅ |
| `inventario.merma_recorded` | ✅ | ✅ | ❌ | ✅ |
| `proveedor.incidencia_created` | ✅ | ❌ | ✅ | ✅ |
| `automatizacion.pedido_sugerido` | ❌ | ❌ | ✅ | ✅ |
| `alert.raised` | — | ❌ | ✅ | ✅ |

Cada módulo define en su sprint qué eventos consume y cómo reacciona.

---

## Idempotencia y dedup

- `emit_event()` tiene ventana dedup de 5s por defecto (clave: hotel + aggregate_type + aggregate_id + event_type).
- Si un trigger se dispara 2× en la misma transacción, el segundo se descarta.
- Los consumidores deben ser idempotentes: recibir el mismo evento 2× no debe causar efectos duplicados.

---

## Versionado

- Una vez publicado, un `event_type` no cambia de estructura.
- Si el payload necesita evolucionar, crear un evento nuevo con sufijo versión: `evento.updated.v2`.
- Marcar el original como deprecated en `decisions-log.md` y mantener consumidores durante ventana de migración.

---

## Prohibiciones

- **Prohibido** llamar directamente entre módulos. Si A necesita algo de B, B emite evento y A reacciona.
- **Prohibido** emitir eventos desde el cliente.
- **Prohibido** payloads con credentials, tokens o PII sensible.
- **Prohibido** modificar `event_type` o payload tras publicación.
- **Prohibido** consumidores que asumen orden estricto de eventos (usar `occurred_at` para ordenar si importa).

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/core-constraints.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/database-security.md`
- `/.ai/specs/module-list.md`
- Los sprints por módulo (cada uno declara qué eventos emite y consume)

---

## Estado de esta especificación

Este documento define el contrato oficial de domain events de ChefOS v3.

Toda comunicación inter-modular pasa por aquí.
