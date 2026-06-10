import { formatFullMonthLabel } from '../utils/chartUtils'

import type { MonthlySalesItem } from '../dashboard.types'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value?: number; payload?: MonthlySalesItem }>
  valueFormatter: (value: number) => string
  valueLabel: string
}

export function ChartTooltip({
  active,
  payload,
  valueFormatter,
  valueLabel,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]
  const value = Number(point?.value ?? 0)
  const item = point?.payload

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs text-muted-foreground">
        {item ? formatFullMonthLabel(item.year, item.month) : ''}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">
        {valueLabel}: {valueFormatter(value)}
      </p>
    </div>
  )
}
