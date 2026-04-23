'use client'

import { useState } from 'react'
import {
  useAddAlias,
  useProductAliases,
  useRemoveAlias,
} from '../application/use-product-aliases'
import { ALIAS_SOURCE_LABELS } from '../domain/invariants'
import type { AliasSourceType } from '../domain/types'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  productId: string
}

export function AliasManager({ hotelId, productId }: Props) {
  const { data: aliases = [], isLoading } = useProductAliases(hotelId, productId)
  const add = useAddAlias()
  const remove = useRemoveAlias()
  const [newAlias, setNewAlias] = useState('')

  const handleAdd = async () => {
    const trimmed = newAlias.trim()
    if (!trimmed) return
    try {
      await add.mutateAsync({
        hotel_id: hotelId,
        product_id: productId,
        alias_name: trimmed,
        source_type: 'manual' as AliasSourceType,
        confidence_score: 1.0,
      })
      setNewAlias('')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nuevo alias (ej. 'tomate rama')"
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="flex-1 rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        />
        <Button onClick={handleAdd} disabled={add.isPending || !newAlias.trim()}>
          Añadir
        </Button>
      </div>
      {add.error && <p className="text-xs text-danger">{String(add.error.message)}</p>}

      {isLoading ? (
        <p className="kpi-label">Cargando alias…</p>
      ) : aliases.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">
          No hay alias aún. Añade variaciones del nombre (ej. &quot;tomate rama&quot;, &quot;kumato&quot;) para mejorar el matching al importar recetas.
        </p>
      ) : (
        <ul
          className="divide-y rounded border"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          {aliases.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <span className="font-medium">{a.alias_name}</span>
                <span className="ml-3 text-xs text-[color:var(--color-text-muted)]">
                  {ALIAS_SOURCE_LABELS[a.source_type] ?? a.source_type} · confianza{' '}
                  {(a.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => remove.mutate({ hotelId, aliasId: a.id })}
                disabled={remove.isPending}
              >
                Borrar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
