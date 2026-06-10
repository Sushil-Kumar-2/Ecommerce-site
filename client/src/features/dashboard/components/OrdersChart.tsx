import { lazy, Suspense, useMemo } from 'react'

import { ChartCard } from '@/components/dashboard/ChartCard'

import { ChartTooltip } from './ChartTooltip'
import {
  CHART_MARGIN,
  CHART_MONTHS,
  fillMonthlySeries,
  hasChartActivity,
  sumOrders,
} from '../utils/chartUtils'

import type { MonthlySalesItem } from '../dashboard.types'

const LazyOrdersChart = lazy(async () => {
  const recharts = await import('recharts')
  const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } =
    recharts

  return {
    default: function OrdersBarChart({ data }: { data: MonthlySalesItem[] }) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART_MARGIN} barCategoryGap="28%">
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
              allowDecimals={false}
              width={36}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
              content={
                <ChartTooltip
                  valueFormatter={(value) => value.toLocaleString('en-IN')}
                  valueLabel="Orders"
                />
              }
            />
            <Bar
              dataKey="orders"
              fill="var(--brand-deal)"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    },
  }
})

interface OrdersChartProps {
  data: MonthlySalesItem[]
  isLoading?: boolean
}

export function OrdersChart({ data, isLoading = false }: OrdersChartProps) {
  const series = useMemo(() => fillMonthlySeries(data, CHART_MONTHS), [data])
  const totalOrders = useMemo(() => sumOrders(series), [series])
  const hasData = hasChartActivity(series)

  return (
    <ChartCard
      title="Monthly Orders"
      description={`Last ${CHART_MONTHS} months · ${totalOrders.toLocaleString('en-IN')} orders`}
      isLoading={isLoading}
    >
      {!hasData ? (
        <div className="flex h-72 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground">
            Order volume will show up here as sales grow.
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
            <LazyOrdersChart data={series} />
          </Suspense>
        </div>
      )}
    </ChartCard>
  )
}
