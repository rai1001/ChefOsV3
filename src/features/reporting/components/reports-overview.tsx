'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { BarChart3, Factory, PackageSearch, Percent, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReportDateRange } from '../domain/filters'
import { foodCostTotals } from '../domain/food-cost'
import { wasteTotals } from '../domain/waste'
import { useFoodCostReport } from '../application/use-food-cost-report'
import { usePriceChangesReport } from '../application/use-price-changes-report'
import { useStockHealthReport } from '../application/use-stock-health-report'
import { useTopProductsReport } from '../application/use-top-products-report'
import { useWasteReport } from '../application/use-waste-report'
import {
  currencyFormatter,
  MetricCard,
  numberFormatter,
  ReportDateFilters,
} from './report-ui'

export function ReportsOverview({
  hotelId,
  range,
}: {
  hotelId: string
  range: ReportDateRange
}) {
  const foodCost = useFoodCostReport({ hotelId, ...range })
  const waste = useWasteReport({ hotelId, ...range })
  const topProducts = useTopProductsReport({
    hotelId,
    ...range,
    dimension: 'consumed_value',
    limit: 10,
  })
  const priceChanges = usePriceChangesReport({ hotelId, ...range, limit: 50 })
  const stockHealth = useStockHealthReport(hotelId)

  const foodTotals = foodCostTotals(foodCost.data ?? [])
  const wasteReportTotals = wasteTotals(waste.data ?? [])

  return (
    <div className="space-y-6">
      <ReportDateFilters range={range} />
      <div className="grid gap-3 md:grid-cols-5">
        <MetricCard label="Coste real" value={currencyFormatter.format(foodTotals.actualCost)} />
        <MetricCard label="Mermas" value={currencyFormatter.format(wasteReportTotals.cost)} />
        <MetricCard label="Top productos" value={topProducts.data?.length ?? 0} />
        <MetricCard label="Cambios precio" value={priceChanges.data?.length ?? 0} />
        <MetricCard
          label="Valor stock"
          value={currencyFormatter.format(stockHealth.data?.summary.total_stock_value ?? 0)}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          href={`/reports/food-cost?from=${range.from}&to=${range.to}`}
          icon={<Factory className="h-5 w-5" aria-hidden="true" />}
          title="Food cost por receta"
          stat={currencyFormatter.format(foodTotals.actualCost)}
        />
        <ReportCard
          href={`/reports/waste?from=${range.from}&to=${range.to}`}
          icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
          title="Mermas"
          stat={currencyFormatter.format(wasteReportTotals.cost)}
        />
        <ReportCard
          href={`/reports/top-products?from=${range.from}&to=${range.to}`}
          icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
          title="Top productos"
          stat={`${topProducts.data?.length ?? 0} filas`}
        />
        <ReportCard
          href={`/reports/price-changes?from=${range.from}&to=${range.to}`}
          icon={<Percent className="h-5 w-5" aria-hidden="true" />}
          title="Variación de precio"
          stat={`${priceChanges.data?.length ?? 0} cambios`}
        />
        <ReportCard
          href="/reports/stock-health"
          icon={<PackageSearch className="h-5 w-5" aria-hidden="true" />}
          title="Stock health"
          stat={numberFormatter.format(stockHealth.data?.summary.total_qty_on_hand ?? 0)}
        />
      </section>
    </div>
  )
}

function ReportCard({
  href,
  icon,
  title,
  stat,
}: {
  href: string
  icon: ReactNode
  title: string
  stat: string
}) {
  return (
    <div
      className="rounded border p-5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="mb-3 flex items-center gap-2 text-[color:var(--color-text-muted)]">
        {icon}
        <p className="kpi-label">{title}</p>
      </div>
      <p className="font-data text-2xl">{stat}</p>
      <Button asChild size="sm" variant="secondary" className="mt-4">
        <Link href={href}>Abrir</Link>
      </Button>
    </div>
  )
}
