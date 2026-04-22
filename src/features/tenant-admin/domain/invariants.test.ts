import { describe, it, expect } from 'vitest'
import {
  canRevokeInvite,
  computeInviteStatus,
  INVITE_STATUS_LABELS,
  INVITE_STATUS_VARIANT,
  isInviteAcceptable,
  isInviteAccepted,
  isInviteExpired,
  isInviteRevoked,
} from './invariants'

const NOW = new Date('2026-04-22T10:00:00Z')
const FUTURE = '2026-05-01T10:00:00Z'
const PAST = '2026-04-01T10:00:00Z'

function invite(overrides: Partial<{
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  email: string
}> = {}) {
  return {
    expires_at: FUTURE,
    accepted_at: null,
    revoked_at: null,
    email: 'test@example.com',
    ...overrides,
  }
}

describe('isInviteExpired', () => {
  it('futuro → false', () => {
    expect(isInviteExpired({ expires_at: FUTURE }, NOW)).toBe(false)
  })
  it('pasado → true', () => {
    expect(isInviteExpired({ expires_at: PAST }, NOW)).toBe(true)
  })
  it('exactamente now → true (<=)', () => {
    expect(isInviteExpired({ expires_at: NOW.toISOString() }, NOW)).toBe(true)
  })
})

describe('isInviteAccepted / isInviteRevoked', () => {
  it('accepted_at null → not accepted', () => {
    expect(isInviteAccepted({ accepted_at: null })).toBe(false)
  })
  it('accepted_at set → accepted', () => {
    expect(isInviteAccepted({ accepted_at: NOW.toISOString() })).toBe(true)
  })
  it('revoked_at null → not revoked', () => {
    expect(isInviteRevoked({ revoked_at: null })).toBe(false)
  })
  it('revoked_at set → revoked', () => {
    expect(isInviteRevoked({ revoked_at: NOW.toISOString() })).toBe(true)
  })
})

describe('isInviteAcceptable', () => {
  it('pending + email match → true', () => {
    expect(isInviteAcceptable(invite(), 'test@example.com', NOW)).toBe(true)
  })
  it('pending + email uppercase caller → true (case-insensitive)', () => {
    expect(isInviteAcceptable(invite(), 'TEST@Example.COM', NOW)).toBe(true)
  })
  it('pending + email mismatch → false', () => {
    expect(isInviteAcceptable(invite(), 'other@example.com', NOW)).toBe(false)
  })
  it('caller email null/undefined → false', () => {
    expect(isInviteAcceptable(invite(), null, NOW)).toBe(false)
    expect(isInviteAcceptable(invite(), undefined, NOW)).toBe(false)
  })
  it('accepted → false', () => {
    expect(
      isInviteAcceptable(invite({ accepted_at: NOW.toISOString() }), 'test@example.com', NOW)
    ).toBe(false)
  })
  it('revoked → false', () => {
    expect(
      isInviteAcceptable(invite({ revoked_at: NOW.toISOString() }), 'test@example.com', NOW)
    ).toBe(false)
  })
  it('expired → false', () => {
    expect(isInviteAcceptable(invite({ expires_at: PAST }), 'test@example.com', NOW)).toBe(false)
  })
})

describe('computeInviteStatus', () => {
  it('accepted primero (prioridad)', () => {
    expect(
      computeInviteStatus(
        { expires_at: PAST, accepted_at: NOW.toISOString(), revoked_at: null },
        NOW
      )
    ).toBe('accepted')
  })
  it('revoked antes de expired si no está accepted', () => {
    expect(
      computeInviteStatus(
        { expires_at: PAST, accepted_at: null, revoked_at: NOW.toISOString() },
        NOW
      )
    ).toBe('revoked')
  })
  it('expired si no accepted y no revoked pero caducado', () => {
    expect(
      computeInviteStatus({ expires_at: PAST, accepted_at: null, revoked_at: null }, NOW)
    ).toBe('expired')
  })
  it('pending si todo lo demás es false', () => {
    expect(
      computeInviteStatus({ expires_at: FUTURE, accepted_at: null, revoked_at: null }, NOW)
    ).toBe('pending')
  })
})

describe('canRevokeInvite', () => {
  it('pending → true', () => {
    expect(canRevokeInvite({ accepted_at: null, revoked_at: null })).toBe(true)
  })
  it('accepted → false', () => {
    expect(canRevokeInvite({ accepted_at: NOW.toISOString(), revoked_at: null })).toBe(false)
  })
  it('already revoked → false', () => {
    expect(canRevokeInvite({ accepted_at: null, revoked_at: NOW.toISOString() })).toBe(false)
  })
})

describe('Labels & variants', () => {
  it('INVITE_STATUS_LABELS cubre los 4 estados', () => {
    ;(['pending', 'accepted', 'revoked', 'expired'] as const).forEach((s) => {
      expect(INVITE_STATUS_LABELS[s]).toBeDefined()
      expect(INVITE_STATUS_VARIANT[s]).toBeDefined()
    })
  })
})
