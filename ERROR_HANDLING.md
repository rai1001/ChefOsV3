# Manejo de Errores y Logging

## Objetivo
Que toda la app (UI, data layer, RPCs/Edge Functions) maneje errores de forma consistente, segura y entendible para usuario final.

## 1) Principios
- **No** mostrar errores técnicos crudos al usuario.
- Mapear errores de Supabase/HTTP a un modelo común (`AppError`).
- Logging estructurado (JSON) con contexto (módulo, operación, orgId, userId, requestId).
- Fallar rápido si falta configuración (secrets obligatorios).

## 2) AppError (modelo recomendado)
Tipos sugeridos:
- `AuthError`
- `ValidationError`
- `NotFoundError`
- `ConflictError`
- `PermissionDeniedError`
- `RateLimitError`
- `NetworkError`
- `UnknownError`

Campos:
- `type`
- `message` (técnico)
- `context` (objeto con module/operation + ids)
- `cause` (opcional)

## 3) UI: mensajes user-friendly
- Un helper `getUserMessage(error)` debe traducir `AppError.type` a mensajes en español.
- Un componente `<ErrorMessage />` renderiza el mensaje con estilo consistente.

## 4) Respuesta estándar en APIs / Edge Functions
Para cualquier endpoint (route handler / edge function), responder JSON:

```json
{
  "error": {
    "code": "ValidationError",
    "message": "Datos inválidos",
    "details": {"field": "..."},
    "requestId": "..."
  }
}
```

Reglas:
- 400: Validation
- 401: Auth
- 403: PermissionDenied
- 404: NotFound
- 409: Conflict
- 429: RateLimit (con `Retry-After`)
- 500: Unknown

## 5) Logging
- Evitar `console.log` en producción.
- Usar un `logger` con `info/warn/error` que imprima JSON.
- Incluir siempre: `module`, `operation`, `orgId` (si aplica), `userId` (si aplica), `requestId`.

## 6) Seguridad
- Nunca loguear tokens, cookies, service_role, API keys o PII sensible.
- Sanitizar errores externos antes de devolver al cliente.
