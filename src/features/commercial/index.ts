/**
 * Contrato público del módulo `commercial` — safe para Client y Server Components.
 *
 * Ajustado a la realidad de v2 por ADR-0008 (state machine 8 estados + event_spaces).
 *
 * **Regla de oro**: nada fuera de este módulo debe importar desde
 * `./domain`, `./application` o `./infrastructure` directamente.
 *
 * Ver `.ai/specs/core-constraints.md § 7` y `.ai/specs/decisions-log.md § ADR-0008`.
 */

// ── Domain types ───────────────────────────────────────────────────
export type {
  EventStatus,
  EventType,
  ServiceType,
  VipLevel,
  Event,
  Client,
  EventSpace,
  EventMenu,
  EventOperationalImpact,
  CalendarEvent,
  EventsFilter,
  BeoData,
  BeoClient,
  BeoMenu,
  BeoSection,
  BeoRecipe,
  BeoSpace,
  BeoImpactByDept,
  BeoImpactItem,
} from './domain/types'

export { EVENT_STATUSES, EVENT_TYPES, SERVICE_TYPES, VIP_LEVELS } from './domain/types'

// ── Invariants (pure functions + labels) ───────────────────────────
export {
  // Labels
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANT,
  EVENT_TYPE_LABELS,
  SERVICE_TYPE_LABELS,
  VIP_LEVEL_LABELS,
  // State machine
  VALID_TRANSITIONS,
  TERMINAL_STATUSES,
  canTransition,
  getValidNextStatuses,
  isTerminalStatus,
  isEventLocked,
  canConfirmEvent,
  requiresCancelReason,
} from './domain/invariants'

export type { StatusVariant } from './domain/invariants'

// ── Errors ─────────────────────────────────────────────────────────
export {
  EventNotFoundError,
  ClientNotFoundError,
  InvalidTransitionError,
  EventTerminalStateError,
  EventRequiresMenuError,
  EventCancelRequiresReasonError,
} from './domain/errors'

// ── Application: client hooks ──────────────────────────────────────
export { useEvents, useEventsInfinite } from './application/use-events'
export { useEvent } from './application/use-event'
export { useEventsCalendar } from './application/use-events-calendar'
export { useEventSpaces } from './application/use-event-spaces'
export { useEventMenus } from './application/use-event-menus'
export { useCreateEvent } from './application/use-create-event'
export { useUpdateEvent } from './application/use-update-event'
export { useTransitionEvent } from './application/use-transition-event'
export { useClients, useClientsInfinite } from './application/use-clients'
export { useClient } from './application/use-client'
export { useCreateClient } from './application/use-create-client'
export { useEventBeo } from './application/use-event-beo'
export { useCalculateEventCost } from './application/use-calculate-event-cost'
export { useGenerateOperationalImpact } from './application/use-generate-operational-impact'

// NOTE: Schemas Zod (`./application/schemas.ts`) e `./infrastructure/*` NO se re-exportan —
// se consumen directamente desde las Server Actions del módulo (src/app/(app)/events/*).
