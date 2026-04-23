# ChefOS v3 Error Messages Enum

## Objetivo

Este documento define el catálogo oficial de mensajes de error y confirmación usados en la UI de ChefOS v3.

Su propósito es evitar:

- mensajes improvisados en cada pantalla
- inconsistencia de tono entre módulos
- fugas técnicas al usuario final (stack traces, IDs internos)
- traducciones divergentes
- mensajes ambiguos que no guían al usuario

Este documento es normativo.

---

## Principios

1. El usuario lee mensajes cortos, claros y accionables.
2. Ningún mensaje expone stack traces, UUIDs o errores técnicos en bruto.
3. Los mensajes son i18n-ready desde el primer commit.
4. Cada categoría tiene un prefijo identificable.
5. El tono es profesional, directo, sin emojis.

---

## Categorías

### Autenticación (`AUTH_`)

| Código              | Mensaje UI                                       | Cuándo usar                               |
| ------------------- | ------------------------------------------------ | ----------------------------------------- |
| `AUTH_INVALID`      | Credenciales inválidas.                          | Email o password incorrectos              |
| `AUTH_NO_ROLE`      | Tu cuenta no tiene rol asignado para este hotel. | Usuario autenticado sin membership válida |
| `AUTH_EXPIRED`      | Tu sesión ha expirado. Vuelve a iniciar sesión.  | Token expirado                            |
| `AUTH_NOT_VERIFIED` | Debes verificar tu email antes de acceder.       | Email sin confirmar                       |
| `AUTH_LOCKED`       | Cuenta bloqueada. Contacta con el administrador. | Rate limit por intentos fallidos          |

### Validación (`VALIDATION_`)

| Código                    | Mensaje UI                       | Cuándo usar                             |
| ------------------------- | -------------------------------- | --------------------------------------- |
| `VALIDATION_REQUIRED`     | Campo obligatorio.               | Campo requerido vacío                   |
| `VALIDATION_INVALID`      | Valor inválido.                  | Formato no válido (email, número, etc.) |
| `VALIDATION_TOO_SHORT`    | Mínimo {n} caracteres.           | String por debajo del mínimo            |
| `VALIDATION_TOO_LONG`     | Máximo {n} caracteres.           | String por encima del máximo            |
| `VALIDATION_OUT_OF_RANGE` | Valor fuera del rango permitido. | Número fuera de rango                   |

### Permisos (`PERMISSION_`)

| Código                      | Mensaje UI                                    | Cuándo usar                              |
| --------------------------- | --------------------------------------------- | ---------------------------------------- |
| `PERMISSION_DENIED`         | No tienes permisos para realizar esta acción. | Rol insuficiente                         |
| `PERMISSION_HOTEL_MISMATCH` | No puedes acceder a datos de otro hotel.      | Cross-tenant detectado                   |
| `PERMISSION_ROLE_REQUIRED`  | Esta acción requiere rol {role}.              | Acción admin-only intentada por otro rol |

### Operaciones (`SAVE_` / `LOAD_` / `DELETE_`)

| Código            | Mensaje UI                                                         | Cuándo usar               |
| ----------------- | ------------------------------------------------------------------ | ------------------------- |
| `SAVE_OK`         | Guardado correctamente.                                            | Operación exitosa         |
| `SAVE_FAIL`       | No se pudo guardar. Inténtalo de nuevo.                            | Error genérico al guardar |
| `SAVE_CONFLICT`   | Otra persona modificó este registro. Recarga para ver los cambios. | Conflicto de concurrencia |
| `LOAD_FAIL`       | No se pudo cargar la información.                                  | Error genérico al leer    |
| `LOAD_NOT_FOUND`  | No encontramos el elemento solicitado.                             | 404 de recurso            |
| `DELETE_OK`       | Eliminado correctamente.                                           | Borrado exitoso           |
| `DELETE_FAIL`     | No se pudo eliminar. Inténtalo de nuevo.                           | Error al borrar           |
| `DELETE_CONFLICT` | No se puede eliminar: tiene dependencias activas.                  | FK constraint             |

### Estado de evento / producción / stock (`STATE_`)

| Código                     | Mensaje UI                          | Cuándo usar                              |
| -------------------------- | ----------------------------------- | ---------------------------------------- |
| `STATE_TRANSITION_INVALID` | No se puede pasar de {from} a {to}. | Transición no permitida en state machine |
| `STATE_ALREADY_PROCESSED`  | Este elemento ya fue procesado.     | Idempotencia en operaciones              |
| `STATE_BLOCKED_BY`         | Bloqueado por: {reason}.            | Operación bloqueada por dependencia      |

### Rate limits y red (`RATE_` / `NETWORK_`)

| Código            | Mensaje UI                                               | Cuándo usar      |
| ----------------- | -------------------------------------------------------- | ---------------- |
| `RATE_LIMIT`      | Demasiadas peticiones. Inténtalo en unos segundos.       | 429 del servidor |
| `NETWORK_OFFLINE` | Sin conexión. Algunas acciones no están disponibles.     | Usuario offline  |
| `NETWORK_TIMEOUT` | La petición está tardando demasiado. Inténtalo de nuevo. | Timeout de red   |

### Integraciones (`INTEGRATION_`)

| Código                            | Mensaje UI                              | Cuándo usar                                 |
| --------------------------------- | --------------------------------------- | ------------------------------------------- |
| `INTEGRATION_UNAVAILABLE`         | El servicio externo no responde.        | PMS / POS caído                             |
| `INTEGRATION_CREDENTIALS_INVALID` | Credenciales de integración inválidas.  | Credentials rechazadas por servicio externo |
| `INTEGRATION_CONFIG_DISABLED`     | Esta sincronización está deshabilitada. | `config.<sync_type>` es false               |

---

## Reglas de implementación

### 1. Constante tipada

Los códigos viven en `src/lib/errors/messages.ts`:

```typescript
export const ERROR_MESSAGES = {
  AUTH_INVALID: 'Credenciales inválidas.',
  AUTH_NO_ROLE: 'Tu cuenta no tiene rol asignado para este hotel.',
  // ...
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGES
```

### 2. No strings sueltos

Prohibido escribir mensajes de error en los componentes. Usar siempre `ERROR_MESSAGES[code]`.

### 3. Interpolación segura

Para mensajes con placeholders (`{n}`, `{role}`, `{from}`, `{to}`, `{reason}`), usar helper `formatErrorMessage(code, params)`.

### 4. Mapear errores de Supabase

Los errores de Supabase (PostgrestError, AuthError) se mapean a códigos del enum en `src/lib/errors/supabase-error-mapper.ts`. La UI nunca ve el error bruto.

### 5. Logging vs display

- **Display** (usuario ve): mensaje del catálogo.
- **Logging** (monitoreo): stack trace completo, códigos Postgres, request ID.

Los dos niveles son independientes. El usuario nunca debe leer el log.

---

## Ampliación del catálogo

Añadir un código nuevo requiere:

1. Justificar por qué no cabe en códigos existentes.
2. Añadir entrada en la tabla de este documento.
3. Añadir constante en `src/lib/errors/messages.ts`.
4. Registrar en `decisions-log.md` si el mensaje afecta UX de múltiples módulos.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/coding-standards.md`
- `/.ai/specs/core-constraints.md`
- `/.ai/checklists/ui-design-checklist.md`

---

## Estado de esta especificación

Este documento define el catálogo oficial de mensajes UI para ChefOS v3.

Todo mensaje mostrado al usuario debe provenir de este catálogo.
