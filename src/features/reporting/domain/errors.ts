import { ValidationError } from '@/lib/errors'
import type { TopProductsDimension } from './filters'

export class ReportInvalidDimensionError extends ValidationError {
  override readonly code = 'REPORT_INVALID_DIMENSION' as const

  constructor(
    public readonly dimension: string,
    public readonly allowed: readonly TopProductsDimension[],
    message?: string
  ) {
    super(message ?? `Dimensión de reporting no válida: ${dimension}`)
    this.name = 'ReportInvalidDimensionError'
  }
}
