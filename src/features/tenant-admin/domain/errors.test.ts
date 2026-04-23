import { describe, it, expect } from 'vitest'
import {
  AlreadyMemberError,
  HotelSlugConflictError,
  InviteAlreadyAcceptedError,
  InviteEmailMismatchError,
  InviteExpiredError,
  InviteNotFoundError,
  InviteRevokedError,
  MembershipNotFoundError,
  TenantAlreadyExistsError,
} from './errors'

describe('tenant-admin domain errors', () => {
  it('cada error lleva code único y class name', () => {
    const errs = [
      new TenantAlreadyExistsError(),
      new HotelSlugConflictError('my-hotel'),
      new InviteNotFoundError(),
      new InviteExpiredError(),
      new InviteAlreadyAcceptedError(),
      new InviteRevokedError(),
      new InviteEmailMismatchError(),
      new AlreadyMemberError('test@x.com'),
      new MembershipNotFoundError('uuid-x'),
    ]
    const codes = errs.map((e) => e.code)
    expect(new Set(codes).size).toBe(codes.length) // asegurar unicidad de códigos
  })

  it('HotelSlugConflictError retiene slug', () => {
    const e = new HotelSlugConflictError('hotel-a')
    expect(e.slug).toBe('hotel-a')
    expect(e.message).toContain('hotel-a')
  })

  it('AlreadyMemberError retiene email', () => {
    const e = new AlreadyMemberError('a@b.com')
    expect(e.email).toBe('a@b.com')
  })

  it('MembershipNotFoundError retiene id', () => {
    const e = new MembershipNotFoundError('mem-1')
    expect(e.membershipId).toBe('mem-1')
  })
})
