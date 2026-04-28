'use client'

import { useMemo, useState } from 'react'
import { Save, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useGoodsReceipts } from '@/features/procurement'
import type { ComplianceDateRange } from '../domain/filters'
import { useQualityCheck } from '../application/use-quality-check'
import { useQualityCheckList } from '../application/use-quality-check-list'

export function QualityCheckForm({ hotelId }: { hotelId: string }) {
  const receipts = useGoodsReceipts({ hotelId }, { pageSize: 100 })
  const mutation = useQualityCheck()
  const [goodsReceiptId, setGoodsReceiptId] = useState('')
  const [temperature, setTemperature] = useState('')
  const [temperatureOk, setTemperatureOk] = useState(true)
  const [packagingOk, setPackagingOk] = useState(true)
  const [expiryOk, setExpiryOk] = useState(true)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const receiptRows = receipts.data?.rows ?? []

  async function submit() {
    if (!goodsReceiptId) {
      setError('Recepción obligatoria')
      return
    }

    setError(null)
    await mutation.mutateAsync({
      hotel_id: hotelId,
      goods_receipt_id: goodsReceiptId,
      temperature_c: temperature === '' ? null : Number(temperature),
      temperature_ok: temperatureOk,
      packaging_ok: packagingOk,
      expiry_ok: expiryOk,
      notes,
    })
    setTemperature('')
    setNotes('')
  }

  return (
    <section
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        <h2>Control de recepción</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="kpi-label mb-1 block">Recepción</span>
          <select
            value={goodsReceiptId}
            onChange={(event) => setGoodsReceiptId(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
          >
            <option value="">Selecciona GR</option>
            {receiptRows.map((receipt) => (
              <option key={receipt.id} value={receipt.id}>
                {receipt.id.slice(0, 8)} · {receipt.supplier_name ?? 'Proveedor'}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="kpi-label mb-1 block">Temperatura °C</span>
          <Input
            type="number"
            step="0.01"
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
          />
        </label>
        <div className="grid gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={temperatureOk}
              onChange={(event) => setTemperatureOk(event.target.checked)}
            />
            Temperatura OK
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={packagingOk}
              onChange={(event) => setPackagingOk(event.target.checked)}
            />
            Envase OK
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={expiryOk}
              onChange={(event) => setExpiryOk(event.target.checked)}
            />
            Caducidad OK
          </label>
        </div>
        <label className="block md:col-span-2">
          <span className="kpi-label mb-1 block">Notas</span>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
      </div>
      <Button type="button" onClick={submit} disabled={mutation.isPending} className="mt-4">
        <Save className="h-4 w-4" aria-hidden="true" />
        Guardar control
      </Button>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {receipts.error ? <p className="mt-3 text-sm text-danger">{receipts.error.message}</p> : null}
      {mutation.error ? <p className="mt-3 text-sm text-danger">{mutation.error.message}</p> : null}
    </section>
  )
}

export function QualityChecksList({
  hotelId,
  range,
}: {
  hotelId: string
  range: ComplianceDateRange
}) {
  const filter = useMemo(() => ({ hotelId, ...range }), [hotelId, range])
  const checks = useQualityCheckList(filter)
  const rows = checks.data ?? []

  return (
    <section className="space-y-3">
      <h2>Controles registrados</h2>
      {checks.isLoading ? <p className="kpi-label">Cargando controles...</p> : null}
      {checks.error ? <p className="text-danger">Error: {checks.error.message}</p> : null}
      <div
        className="overflow-hidden rounded border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
              <th className="kpi-label px-3 py-2">GR</th>
              <th className="kpi-label px-3 py-2">Fecha</th>
              <th className="kpi-label px-3 py-2">Temp.</th>
              <th className="kpi-label px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                <td className="px-3 py-2 font-code text-xs">{row.goods_receipt_id.slice(0, 8)}</td>
                <td className="px-3 py-2">{new Date(row.checked_at).toLocaleString('es-ES')}</td>
                <td className="px-3 py-2 font-data">{row.temperature_c ?? '-'}</td>
                <td className="px-3 py-2">
                  <span className={`badge-status ${row.all_ok ? 'neutral' : 'warning'}`}>
                    {row.all_ok ? 'OK' : 'Incidencia'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !checks.isLoading ? (
          <p className="p-4 text-sm text-[color:var(--color-text-muted)]">Sin controles.</p>
        ) : null}
      </div>
    </section>
  )
}

