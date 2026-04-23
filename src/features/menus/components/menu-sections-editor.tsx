'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAddMenuSection,
  useMenuSections,
  useRemoveMenuSection,
} from '../application/use-menu-sections'
import { nextSectionSortOrder } from '../domain/invariants'
import { MenuSectionRecipesPanel } from './menu-section-recipes-panel'

interface Props {
  hotelId: string
  menuId: string
}

export function MenuSectionsEditor({ hotelId, menuId }: Props) {
  const sectionsQ = useMenuSections(hotelId, menuId)
  const addSection = useAddMenuSection(hotelId)
  const removeSection = useRemoveMenuSection(hotelId, menuId)

  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sections = sectionsQ.data ?? []

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      await addSection.mutateAsync({
        menu_id: menuId,
        name: newName.trim(),
        sort_order: nextSectionSortOrder(sections),
      })
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error añadiendo sección')
    }
  }

  return (
    <div className="space-y-4">
      {sectionsQ.isLoading ? (
        <p className="kpi-label">Cargando secciones…</p>
      ) : sections.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Sin secciones todavía. Añade una abajo.
        </p>
      ) : (
        <ul className="space-y-3">
          {sections.map((s) => (
            <li
              key={s.id}
              className="rounded border p-4 space-y-3"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="kpi-label">Sección #{s.sort_order}</p>
                  <h3>{s.name}</h3>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={removeSection.isPending}
                  onClick={() => {
                    if (confirm(`Eliminar sección "${s.name}"? Se quitarán todas sus recetas.`)) {
                      removeSection.mutate(s.id)
                    }
                  }}
                >
                  Eliminar sección
                </Button>
              </div>
              <MenuSectionRecipesPanel hotelId={hotelId} sectionId={s.id} />
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={submit}
        className="flex items-end gap-3 rounded border p-3"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="space-y-1 flex-1">
          <Label htmlFor="sec_name">Nueva sección</Label>
          <Input
            id="sec_name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            placeholder="Entrantes, Principales, Postres…"
          />
        </div>
        <Button type="submit" size="sm" disabled={addSection.isPending}>
          {addSection.isPending ? 'Añadiendo…' : 'Añadir sección'}
        </Button>
      </form>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
