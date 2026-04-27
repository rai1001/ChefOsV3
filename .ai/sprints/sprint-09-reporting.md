# Sprint-09 - Reporting / Dashboards

## Objetivo

Construir dashboards consultables sobre datos reales ya existentes en ChefOS v3, sin tocar flujos operativos ni crear procesos derivados.

El módulo `reporting` queda como capa read-only para dirección, cocina senior y compras.

## Alcance

Incluye:

- Food cost por receta: coste real consumido por órdenes y variación vs estimado.
- Mermas: cantidad, coste y ratio merma/consume por producto y periodo.
- Top productos: consumidos por valor/cantidad, mermados por valor y mayor variación de precio.
- Variación de precio: lectura agregada de `v3_price_change_log`.
- Stock health: valor de stock, lotes próximos a caducar y stock muerto.
- Export CSV server-side para informes tabulares.
- Cache cliente de 5 minutos con refresco manual.

No incluye:

- Schedulers, cron o workers.
- Materialized views.
- Realtime, email o Slack.
- Forecasting o KPIs con datos no presentes.
- Escrituras desde reporting.

## Datos y permisos

Las consultas se exponen mediante RPCs `v3_report_*`, todas con:

- `SECURITY DEFINER`.
- `set search_path = public`.
- `v3_check_membership(auth.uid(), p_hotel_id, array['direction','admin','head_chef','sous_chef','procurement'])`.
- Lectura filtrada por `hotel_id`.

La exportación CSV usa Route Handler nativo y valida hotel activo/rol antes de llamar a las RPCs.

## UI

Rutas:

- `/reports`
- `/reports/food-cost`
- `/reports/waste`
- `/reports/top-products`
- `/reports/price-changes`
- `/reports/stock-health`

Las páginas componen componentes del módulo `reporting`; no acceden directamente a Supabase. Los gráficos usan SVG nativo porque no se añade dependencia de charts.

## Riesgos

- Volumen alto en periodos largos: mitigar primero con índices específicos antes de materializar.
- CSV grande: limitar a 10.000 filas por export.
- Zona horaria: los filtros UI envían fechas `YYYY-MM-DD` y el backend interpreta inicio UTC en esta versión.
- Cache: `staleTime` 5 minutos; el botón refrescar invalida manualmente la consulta.

## Validación

Requerida:

- Unit tests de schemas Zod.
- Unit tests de CSV escaping/BOM.
- Unit tests de adapters y hooks.
- E2E live gated con fixture de orden completada, merma y cambio de precio.
- `npm run lint`.
- `npm run typecheck`.
- `npm test -- --run`.
- `npm run build`.

## Definition of Done

- Las 5 RPCs existen, están aplicadas y verificadas por WALL-E.
- Las páginas muestran datos coherentes y estados loading/empty/error.
- Los CSV descargan con headers y filas esperadas.
- No hay escrituras ni features fuera de alcance.
- ADR-0021, module-list, README y CHANGELOG quedan actualizados.
