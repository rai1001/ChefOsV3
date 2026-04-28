export const COMPLIANCE_QUERY_OPTIONS = {
  overview: {
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  traceability: {
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  list: {
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  },
} as const

export const COMPLIANCE_QUERY_KEYS = {
  overview: (hotelId: string | undefined) => ['compliance', 'overview', hotelId] as const,
  traceability: (hotelId: string | undefined, lotId: string | undefined) =>
    ['compliance', 'traceability', hotelId, lotId] as const,
  equipment: (hotelId: string | undefined, activeOnly = true) =>
    ['compliance', 'equipment', hotelId, activeOnly] as const,
  cleaningAreas: (hotelId: string | undefined, activeOnly = true) =>
    ['compliance', 'cleaning-areas', hotelId, activeOnly] as const,
  qualityChecks: (filter: unknown) => ['compliance', 'quality-checks', filter] as const,
  temperatureLogs: (filter: unknown) => ['compliance', 'temperature-logs', filter] as const,
  lotSearch: (hotelId: string | undefined, search: string | undefined) =>
    ['compliance', 'lot-search', hotelId, search ?? ''] as const,
} as const

