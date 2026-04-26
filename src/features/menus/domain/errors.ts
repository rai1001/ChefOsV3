import { NotFoundError, ConflictError } from '@/lib/errors'

export class MenuNotFoundError extends NotFoundError {
  override readonly code = 'MENU_NOT_FOUND' as const
  constructor(
    public readonly menuId: string,
    message?: string
  ) {
    super('Menu', message ?? `Menú no encontrado: ${menuId}`)
    this.name = 'MenuNotFoundError'
  }
}

export class MenuSectionNotFoundError extends NotFoundError {
  override readonly code = 'MENU_SECTION_NOT_FOUND' as const
  constructor(
    public readonly sectionId: string,
    message?: string
  ) {
    super('MenuSection', message ?? `Sección de menú no encontrada: ${sectionId}`)
    this.name = 'MenuSectionNotFoundError'
  }
}

export class RecipeAlreadyInSectionError extends ConflictError {
  override readonly code = 'RECIPE_ALREADY_IN_SECTION' as const
  constructor(
    public readonly sectionId: string,
    public readonly recipeId: string,
    message?: string
  ) {
    super(message ?? `La receta ${recipeId} ya está en la sección ${sectionId}`)
    this.name = 'RecipeAlreadyInSectionError'
  }
}
