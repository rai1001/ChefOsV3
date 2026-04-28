'use client'

import { useState } from 'react'
import { Save, Thermometer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  COMPLIANCE_EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_LABELS,
  type ComplianceEquipmentType,
} from '../domain/schemas'
import { useEquipmentList } from '../application/use-equipment-list'
import { useCreateEquipment, useUpdateEquipment } from '../application/use-equipment-mutations'

export function EquipmentManager({ hotelId }: { hotelId: string }) {
  const equipment = useEquipmentList(hotelId, { activeOnly: false })
  const createMutation = useCreateEquipment()
  const updateMutation = useUpdateEquipment()
  const [name, setName] = useState('')
  const [equipmentType, setEquipmentType] = useState<ComplianceEquipmentType>('fridge')
  const [location, setLocation] = useState('')
  const [minTemperature, setMinTemperature] = useState('0')
  const [maxTemperature, setMaxTemperature] = useState('5')

  async function create() {
    await createMutation.mutateAsync({
      hotel_id: hotelId,
      name,
      equipment_type: equipmentType,
      location,
      min_temperature_c: Number(minTemperature),
      max_temperature_c: Number(maxTemperature),
      is_active: true,
    })
    setName('')
    setLocation('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Thermometer className="h-5 w-5" aria-hidden="true" />
          <h2>Nuevo equipo</h2>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="kpi-label mb-1 block">Nombre</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <span className="kpi-label mb-1 block">Tipo</span>
            <select
              value={equipmentType}
              onChange={(event) => setEquipmentType(event.target.value as ComplianceEquipmentType)}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
            >
              {COMPLIANCE_EQUIPMENT_TYPES.map((type) => (
                <option key={type} value={type}>{EQUIPMENT_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="kpi-label mb-1 block">Ubicación</span>
            <Input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="kpi-label mb-1 block">Mín.</span>
              <Input type="number" value={minTemperature} onChange={(event) => setMinTemperature(event.target.value)} />
            </label>
            <label>
              <span className="kpi-label mb-1 block">Máx.</span>
              <Input type="number" value={maxTemperature} onChange={(event) => setMaxTemperature(event.target.value)} />
            </label>
          </div>
          <Button type="button" onClick={() => void create()} disabled={!name || createMutation.isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Crear
          </Button>
        </div>
        {createMutation.error ? <p className="mt-3 text-sm text-danger">{createMutation.error.message}</p> : null}
      </section>

      <section className="space-y-3">
        <h2>Equipos</h2>
        {(equipment.data ?? []).map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border p-4"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <div>
              <h3>{item.name}</h3>
              <p className="kpi-label">{EQUIPMENT_TYPE_LABELS[item.equipment_type]} · {item.min_temperature_c} a {item.max_temperature_c} °C</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void updateMutation.mutateAsync({
                id: item.id,
                hotel_id: item.hotel_id,
                is_active: !item.is_active,
              })}
            >
              {item.is_active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ))}
        {equipment.error ? <p className="text-danger">Error: {equipment.error.message}</p> : null}
      </section>
    </div>
  )
}

