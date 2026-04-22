import 'server-only'

/**
 * Contrato público server-only del módulo `recipes`.
 * Use estos helpers desde Server Components, Server Actions, Route Handlers.
 */

export { getRecipeServer, getRecipeTechSheetServer } from './application/get-recipe.server'
