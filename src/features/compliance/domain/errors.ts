import { NotFoundError, ValidationError } from '@/lib/errors'

export class ComplianceValidationError extends ValidationError {
  override readonly code = 'COMPLIANCE_VALIDATION' as const

  constructor(message = 'Registro APPCC inválido') {
    super(message)
    this.name = 'ComplianceValidationError'
  }
}

export class ComplianceNotFoundError extends NotFoundError {
  override readonly code = 'COMPLIANCE_NOT_FOUND' as const

  constructor(resource = 'compliance', message?: string) {
    super(resource, message ?? `Recurso APPCC no encontrado: ${resource}`)
    this.name = 'ComplianceNotFoundError'
  }
}

