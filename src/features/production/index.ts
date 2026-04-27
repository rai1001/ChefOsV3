/**
 * Contrato público del módulo `production`.
 *
 * Owner de: órdenes de producción, snapshots de ingredientes escalados,
 * viabilidad de stock y consumo FIFO atómico al iniciar producción.
 */

export type {
  ProductionStatus,
  ProductionOrder,
  ProductionOrderSummary,
  ProductionOrderDetail,
  ProductionMovement,
  CreateProductionOrderInput,
  ProductionOrderIdInput,
  CompleteProductionInput,
  CancelProductionInput,
  ProductionListFilter,
} from './domain/order'

export {
  PRODUCTION_STATUSES,
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_VARIANT,
  canCancelProductionOrder,
  canCompleteProductionOrder,
  canStartProductionOrder,
  productionOrderSchema,
  productionOrderSummarySchema,
  productionOrderDetailSchema,
  createProductionOrderInputSchema,
  productionOrderIdInputSchema,
  completeProductionInputSchema,
  cancelProductionInputSchema,
} from './domain/order'

export type { ScaleRecipeLine, ProductionOrderLine } from './domain/line'
export { scaleRecipeLineSchema, productionOrderLineSchema } from './domain/line'

export type { ProductionFeasibility, ProductionDeficit } from './domain/feasibility'
export {
  productionFeasibilitySchema,
  productionDeficitSchema,
  getMissingProductionProducts,
} from './domain/feasibility'

export {
  ProductionOrderNotFoundError,
  ProductionInsufficientStockError,
  ProductionInvalidStateError,
} from './domain/errors'

export { useScaleRecipe } from './application/use-scale-recipe'
export { useCreateProductionOrder } from './application/use-create-production-order'
export { useCheckFeasibility } from './application/use-check-feasibility'
export { useStartProduction } from './application/use-start-production'
export { useCompleteProduction } from './application/use-complete-production'
export { useCancelProduction } from './application/use-cancel-production'
export { useProductionList } from './application/use-production-list'
export { useProductionDetail } from './application/use-production-detail'
