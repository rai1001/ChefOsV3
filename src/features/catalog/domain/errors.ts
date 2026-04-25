// Errors del módulo catalog — sprint-04a.

export class ProductNotFoundError extends Error {
  readonly code = 'PRODUCT_NOT_FOUND' as const
  constructor(
    public readonly productId: string,
    message?: string
  ) {
    super(message ?? `Producto no encontrado: ${productId}`)
    this.name = 'ProductNotFoundError'
  }
}

export class ProductWrongHotelError extends Error {
  readonly code = 'PRODUCT_WRONG_HOTEL' as const
  constructor(
    public readonly productId: string,
    public readonly hotelId: string,
    message?: string
  ) {
    super(message ?? `El producto ${productId} no pertenece al hotel ${hotelId}`)
    this.name = 'ProductWrongHotelError'
  }
}

export class AliasEmptyError extends Error {
  readonly code = 'ALIAS_EMPTY' as const
  constructor(message = 'El alias no puede estar vacío') {
    super(message)
    this.name = 'AliasEmptyError'
  }
}

export class AliasDuplicateError extends Error {
  readonly code = 'ALIAS_DUPLICATE' as const
  constructor(
    public readonly alias: string,
    message?: string
  ) {
    super(message ?? `El alias "${alias}" ya existe en este hotel`)
    this.name = 'AliasDuplicateError'
  }
}

export class UnitWrongHotelError extends Error {
  readonly code = 'UNIT_WRONG_HOTEL' as const
  constructor(
    public readonly unitId: string,
    public readonly hotelId: string,
    message?: string
  ) {
    super(message ?? `La unidad ${unitId} no pertenece al hotel ${hotelId}`)
    this.name = 'UnitWrongHotelError'
  }
}

export class MappingAmbiguousError extends Error {
  readonly code = 'MAPPING_AMBIGUOUS' as const
  constructor(
    public readonly recipeId: string,
    public readonly ingredientName: string,
    message?: string
  ) {
    super(
      message ??
        `El ingrediente "${ingredientName}" aparece más de una vez en la receta ${recipeId}; no se puede mapear sin ambigüedad`
    )
    this.name = 'MappingAmbiguousError'
  }
}

export class MappingNoMatchError extends Error {
  readonly code = 'MAPPING_NO_MATCH' as const
  constructor(
    public readonly recipeId: string,
    public readonly ingredientName: string,
    message?: string
  ) {
    super(
      message ??
        `No hay ingrediente "${ingredientName}" en la receta ${recipeId}`
    )
    this.name = 'MappingNoMatchError'
  }
}

export class CategoryNotFoundError extends Error {
  readonly code = 'CATEGORY_NOT_FOUND' as const
  constructor(
    public readonly categoryId: string,
    message?: string
  ) {
    super(message ?? `Categoría no encontrada: ${categoryId}`)
    this.name = 'CategoryNotFoundError'
  }
}

// Sprint-04b

export class SupplierNotFoundError extends Error {
  readonly code = 'SUPPLIER_NOT_FOUND' as const
  constructor(public readonly supplierId: string, message?: string) {
    super(message ?? `Proveedor no encontrado: ${supplierId}`)
    this.name = 'SupplierNotFoundError'
  }
}

export class OfferNotFoundError extends Error {
  readonly code = 'OFFER_NOT_FOUND' as const
  constructor(public readonly offerId: string, message?: string) {
    super(message ?? `Oferta no encontrada: ${offerId}`)
    this.name = 'OfferNotFoundError'
  }
}

export class OfferInvalidDateRangeError extends Error {
  readonly code = 'OFFER_INVALID_DATE_RANGE' as const
  constructor(message = 'La fecha de inicio no puede ser posterior a la fecha de fin') {
    super(message)
    this.name = 'OfferInvalidDateRangeError'
  }
}
