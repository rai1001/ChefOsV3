# Seguridad

## Principios
- Seguridad por defecto: **RLS** es la línea principal.
- Menos privilegios: cliente con `anon` key.
- Secrets solo en server/edge (variables de entorno).

## Multi-tenancy (RLS)
- `org_id` en todas las tablas de negocio.
- Policies basadas en `auth.uid()` + membership.
- Tests pgTAP obligatorios para cada tabla nueva.

## Gestión de secrets
- Prohibido hardcodear keys (Gemini/Stripe/etc.).
- Si un secret es obligatorio: fallar rápido y devolver 500 con mensaje genérico.
- Rotación: documentar en `docs/inventory/`.

## Edge Functions
- Rate limiting por org.
- Timeouts en llamadas externas.
- CORS restrictivo.
- Logs sin PII.
