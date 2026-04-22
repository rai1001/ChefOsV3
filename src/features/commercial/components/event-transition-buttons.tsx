'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTransitionEvent } from '../application/use-transition-event'
import {
  EVENT_STATUS_LABELS,
  getValidNextStatuses,
  requiresCancelReason,
} from '../domain/invariants'
import type { EventStatus } from '../domain/types'

interface Props {
  hotelId: string
  eventId: string
  currentStatus: EventStatus
  menuCount: number
}

export function EventTransitionButtons({ hotelId, eventId, currentStatus, menuCount }: Props) {
  const next = getValidNextStatuses(currentStatus)
  const transition = useTransitionEvent(hotelId)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  if (next.length === 0) {
    return <p className="text-sm text-[color:var(--color-text-muted)]">Estado terminal — sin transiciones disponibles.</p>
  }

  const handleTransition = (to: EventStatus) => {
    if (to === 'cancelled') {
      setCancelOpen(true)
      return
    }
    // Invariante UX: confirmar requiere ≥1 menú (la DB también lo valida).
    if (to === 'confirmed' && menuCount < 1) {
      alert('El evento requiere al menos un menú para ser confirmado.')
      return
    }
    transition.mutate({ eventId, newStatus: to })
  }

  const submitCancel = () => {
    if (!requiresCancelReason(cancelReason)) return
    transition.mutate(
      { eventId, newStatus: 'cancelled', reason: cancelReason },
      {
        onSuccess: () => {
          setCancelOpen(false)
          setCancelReason('')
        },
      }
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {next.map((to) => {
          const isCancel = to === 'cancelled'
          const isArchive = to === 'archived'
          return (
            <Button
              key={to}
              variant={isCancel ? 'danger' : isArchive ? 'ghost' : 'primary'}
              size="sm"
              disabled={transition.isPending}
              onClick={() => handleTransition(to)}
            >
              {isCancel ? 'Cancelar' : isArchive ? 'Archivar' : `→ ${EVENT_STATUS_LABELS[to]}`}
            </Button>
          )
        })}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar evento</DialogTitle>
            <DialogDescription>
              Indica el motivo de la cancelación. Esta acción no se puede revertir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ej: Cliente canceló por cambio de fecha"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              variant="danger"
              disabled={!requiresCancelReason(cancelReason) || transition.isPending}
              onClick={submitCancel}
            >
              Cancelar evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
