'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EventsCalendar } from './events-calendar'
import { EventsList } from './events-list'

type ViewMode = 'list' | 'calendar'

export function EventsView({ hotelId }: { hotelId: string }) {
  const [view, setView] = useState<ViewMode>('list')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={view === 'list' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setView('list')}
        >
          Lista
        </Button>
        <Button
          variant={view === 'calendar' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setView('calendar')}
        >
          Calendario
        </Button>
      </div>

      {view === 'list' ? <EventsList hotelId={hotelId} /> : <EventsCalendar hotelId={hotelId} />}
    </div>
  )
}
