export class MenuNotFoundError extends Error {
  readonly code = 'MENU_NOT_FOUND' as const
  constructor(
    public readonly menuId: string,
    message?: string
  ) {
    super(message ?? `Menú no encontrado: ${menuId}`)
    this.name = 'MenuNotFoundError'
  }
}

export class MenuSectionNotFoundError extends Error {
  readonly code = 'MENU_SECTION_NOT_FOUND' as const
  constructor(
    public readonly sectionId: string,
    message?: string
  ) {
    super(message ?? `Sección de menú no encontrada: ${sectionId}`)
    this.name = 'MenuSectionNotFoundError'
  }
}

export class RecipeAlreadyInSectionError extends Error {
  readonly code = 'RECIPE_ALREADY_IN_SECTION' as const
  constructor(
    public readonly sectionId: string,
    public readonly recipeId: string,
    message?: string
  ) {
    super(message ?? `La receta ${recipeId} ya está en la sección ${sectionId}`)
    this.name = 'RecipeAlreadyInSectionError'
  }
}
