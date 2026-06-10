import { lazy, Suspense, useMemo } from 'react'

import { ChartCard } from '@/components/dashboard/ChartCard'
import { formatPrice } from '@/features/products/utils'

import { ChartTooltip } from './ChartTooltip'
import {
  CHART_MARGIN,
  CHART_MONTHS,
  fillMonthlySeries,
  formatCompactCurrency,
  hasChartActivity,
  sumRevenue,
} from '../utils/chartUtils'

import type { MonthlySalesItem } from '../dashboard.types'

const LazyRevenueChart = lazy(async () => {
  const recharts = await import('recharts')
  const {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } = recharts

  return {
    default: function RevenueAreaChart({ data }: { data: MonthlySalesItem[] }) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              dy={8}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompactCurrency}
              width={52}
            />
            <Tooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
              content={
                <ChartTooltip
                  valueFormatter={formatPrice}
                  valueLabel="Revenue"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--brand-primary)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ fill: 'var(--brand-primary)', r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: 'var(--brand-primary)',
                stroke: 'var(--background)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
  }
})

interface RevenueChartProps {
  data: MonthlySalesItem[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  const series = useMemo(() => fillMonthlySeries(data, CHART_MONTHS), [data])
  const totalRevenue = useMemo(() => sumRevenue(series), [series])
  const hasData = hasChartActivity(series)

  return (
    <ChartCard
      title="Monthly Revenue"
      description={`Last ${CHART_MONTHS} months · ${formatPrice(totalRevenue)} total`}
      isLoading={isLoading}
    >
      {!hasData ? (
        <div className="flex h-72 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">No revenue yet</p>
          <p className="text-xs text-muted-foreground">
            Paid orders will appear here month by month.
          </p>
        </div>
      ) : (
        <div className="h-72">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading chart...
              </div>
            }
          >
            <LazyRevenueChart data={series} />
          </Suspense>
        </div>
      )}
    </ChartCard>
  )
}
