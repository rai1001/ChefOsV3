import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ForbiddenError, UnauthorizedError } from '@/lib/errors'

// Genera el template Excel runtime con headers + 1 fila de ejemplo.
// Sprint-03c (ADR-0013).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  let activeHotel
  try {
    activeHotel = await getActiveHotelOrNull()
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      return new Response('Unauthorized', { status: 401 })
    }
    throw err
  }

  if (!activeHotel) {
    return new Response('Unauthorized', { status: 401 })
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'ChefOS'
  workbook.created = new Date()

  // ── Hoja Recetas ──────────────────────────────────────────────────────────
  const recipesSheet = workbook.addWorksheet('Recetas')
  recipesSheet.columns = [
    { header: 'nombre*', key: 'name', width: 32 },
    { header: 'categoria*', key: 'category', width: 14 },
    { header: 'servings*', key: 'servings', width: 10 },
    { header: 'descripcion', key: 'description', width: 40 },
    { header: 'tiempo_prep', key: 'prep_time_min', width: 12 },
    { header: 'tiempo_coccion', key: 'cook_time_min', width: 14 },
    { header: 'precio_objetivo', key: 'target_price', width: 14 },
    { header: 'alergenos', key: 'allergens', width: 24 },
    { header: 'tags', key: 'dietary_tags', width: 20 },
    { header: 'notas', key: 'notes', width: 30 },
  ]
  styleHeaderRow(recipesSheet.getRow(1))
  recipesSheet.addRow({
    name: 'Pollo asado al horno',
    category: 'main',
    servings: 4,
    description: 'Pollo entero al horno con patatas',
    prep_time_min: 15,
    cook_time_min: 60,
    target_price: 12.5,
    allergens: '',
    dietary_tags: 'sin_gluten',
    notes: 'Servir con limón',
  })

  // ── Hoja Ingredientes ─────────────────────────────────────────────────────
  const ingredientsSheet = workbook.addWorksheet('Ingredientes')
  ingredientsSheet.columns = [
    { header: 'receta_nombre*', key: 'recipe_name', width: 32 },
    { header: 'ingrediente*', key: 'ingredient_name', width: 28 },
    { header: 'cantidad_bruta*', key: 'quantity_gross', width: 14 },
    { header: 'unidad', key: 'unit', width: 10 },
    { header: 'merma_pct', key: 'waste_pct', width: 12 },
    { header: 'coste_unitario', key: 'unit_cost', width: 14 },
    { header: 'notas', key: 'preparation_notes', width: 24 },
  ]
  styleHeaderRow(ingredientsSheet.getRow(1))
  ingredientsSheet.addRow({
    recipe_name: 'Pollo asado al horno',
    ingredient_name: 'Pollo entero',
    quantity_gross: 1.5,
    unit: 'kg',
    waste_pct: 5,
    unit_cost: 4.2,
    preparation_notes: 'Limpio y salpimentado',
  })
  ingredientsSheet.addRow({
    recipe_name: 'Pollo asado al horno',
    ingredient_name: 'Patata',
    quantity_gross: 600,
    unit: 'g',
    waste_pct: 10,
    unit_cost: 0.0012,
    preparation_notes: 'Cortadas en cuartos',
  })

  // ── Hoja Instrucciones (read-only para el usuario) ───────────────────────
  const helpSheet = workbook.addWorksheet('Leeme')
  helpSheet.getColumn(1).width = 100
  helpSheet.addRows([
    ['ChefOS · Plantilla de import de recetas'],
    [''],
    ['Reglas:'],
    ['1. Las columnas con * son obligatorias.'],
    ['2. categoria debe ser uno de: starter, main, dessert, sauce, side, drink, bread, pastry, other.'],
    ['3. servings debe ser un entero positivo (1, 2, 3...).'],
    ['4. cantidad_bruta debe ser > 0 (acepta coma o punto decimal).'],
    ['5. merma_pct va entre 0 y 100.'],
    ['6. alergenos y tags son CSV separados por coma o punto y coma. Ej: "gluten, lactosa".'],
    ['7. receta_nombre en Ingredientes debe coincidir EXACTO con nombre en Recetas (case-insensitive, ignora espacios extra).'],
    [''],
    ['Sprint-03c · ChefOS v3'],
  ])
  helpSheet.getRow(1).font = { bold: true, size: 14 }

  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="chefos-recetas-template.xlsx"',
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true }
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8E8E8' },
  }
  row.eachCell((cell) => {
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF888888' } },
    }
  })
}
