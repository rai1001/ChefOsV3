# supabase/functions/

Edge Functions de Supabase.

Operaciones que DEBEN correr aquí (ver `.ai/specs/core-constraints.md § 5`):

- Generación de PDFs / documentos firmados
- Dispatcher de notificaciones (email, push)
- Worker de automatizaciones
- Procesos con API keys de terceros
- Sync con integraciones externas

Cada función valida `Authorization: Bearer <service_role>` antes de actuar.
