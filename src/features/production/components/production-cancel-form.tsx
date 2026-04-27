'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCancelProduction } from '../application/use-cancel-production'

export function ProductionCancelForm({
  hotelId,
  orderId,
}: {
  hotelId: string
  orderId: string
}) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const cancelProduction = useCancelProduction()
  const canSubmit = reason.trim().length > 0 && !cancelProduction.isPending

  const submit = async () => {
    await cancelProduction.mutateAsync({
      hotel_id: hotelId,
      production_order_id: orderId,
      reason: reason.trim(),
    })
    router.push(`/production/${orderId}`)
  }

  return (
    <section
      className="max-w-2xl rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="space-y-4">
        <label className="block">
          <span className="kpi-label mb-1 block">Razón</span>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={5}
            required
          />
        </label>

        <Button type="button" variant="danger" disabled={!canSubmit} onClick={submit}>
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Cancelar orden
        </Button>

        {cancelProduction.error ? (
          <p className="text-sm text-danger">{cancelProduction.error.message}</p>
        ) : null}
      </div>
    </section>
  )
}
