'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { callSwitchActiveHotel } from '../infrastructure/identity-queries'
import type { ActiveHotel } from '../domain/types'

// Convención: las queries scoped por hotel deben usar `[modulo, hotelId, ...]` como key
// (commercial, recipes, menus, tenant-admin lo cumplen tras sprint-hardening).
// Identity tiene su propio set: ['active-hotel'], ['user-hotels'], ['current-user'].
const IDENTITY_HOTEL_DEPENDENT_KEYS: ReadonlyArray<readonly unknown[]> = [
  ['active-hotel'],
  ['user-hotels'],
]
const LEGACY_HOTEL_SCOPED_MODULES = ['recipes', 'menus', 'commercial', 'tenant-admin']

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function shouldInvalidateHotelQuery(
  key: unknown[],
  prevHotelId: string | null,
  newHotelId: string
): boolean {
  if (key.length === 0) return false

  if (IDENTITY_HOTEL_DEPENDENT_KEYS.some((identityKey) => identityKey[0] === key[0])) return true

  const second = key[1]
  if (isUuid(second)) return second === prevHotelId || second === newHotelId

  if (typeof key[0] === 'string') return LEGACY_HOTEL_SCOPED_MODULES.includes(key[0])

  return false
}

export function useSwitchHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newHotelId: string) => {
      const supabase = createClient()
      const prev = queryClient.getQueryData<ActiveHotel>(['active-hotel'])
      await callSwitchActiveHotel(supabase, newHotelId)
      return { newHotelId, prevHotelId: prev?.hotel_id ?? null }
    },
    // Cubre PERF-002 (Codex): invalidación scoped en lugar de global.
    // Solo invalida las queries que dependen del hotel saliente o entrante, más las
    // queries identity que cambian con el hotel activo (active-hotel, user-hotels).
    // Queries 100% global (ej. session, app-config) NO se tocan.
    onSuccess: ({ prevHotelId, newHotelId }) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          if (!Array.isArray(key) || key.length === 0) return false
          return shouldInvalidateHotelQuery(key, prevHotelId, newHotelId)
        },
      })
    },
  })
}
