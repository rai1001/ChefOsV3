'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useActiveHotel, useUserHotels, useSwitchHotel } from '@/features/identity'
import { cn } from '@/lib/utils'

export function HotelSwitcher() {
  const active = useActiveHotel()
  const hotels = useUserHotels()
  const switchHotel = useSwitchHotel()

  const isLoading = active.isLoading || hotels.isLoading
  const items = hotels.data ?? []

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={isLoading || switchHotel.isPending}
          className={cn(
            'flex items-center gap-2 rounded border px-3 py-2 text-sm',
            'disabled:opacity-60'
          )}
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <span className="kpi-label">Hotel</span>
          <span className="font-medium">
            {active.data?.hotel_name ?? (isLoading ? 'Cargando…' : 'Sin hotel')}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="min-w-[240px] rounded border p-1 shadow-lg"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          {items.length === 0 && (
            <div className="px-3 py-2 text-sm text-[color:var(--color-text-muted)]">
              No hay hoteles disponibles
            </div>
          )}
          {items.map((hotel) => {
            const isActive = hotel.hotel_id === active.data?.hotel_id
            return (
              <DropdownMenu.Item
                key={hotel.membership_id}
                onSelect={() => {
                  if (!isActive) switchHotel.mutate(hotel.hotel_id)
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none',
                  'data-[highlighted]:bg-[color:var(--color-bg-hover)]'
                )}
              >
                <Check
                  className={cn('h-4 w-4 shrink-0', isActive ? 'opacity-100' : 'opacity-0')}
                />
                <div className="flex flex-col">
                  <span>{hotel.hotel_name}</span>
                  <span className="kpi-label">{hotel.role}</span>
                </div>
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
