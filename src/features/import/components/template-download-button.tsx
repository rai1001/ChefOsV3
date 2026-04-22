'use client'

import { Button } from '@/components/ui/button'

export function TemplateDownloadButton() {
  return (
    <Button asChild variant="ghost" size="sm">
      <a href="/api/import/template/recipes" download="chefos-recetas-template.xlsx">
        Descargar plantilla Excel
      </a>
    </Button>
  )
}
