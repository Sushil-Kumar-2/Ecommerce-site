import { formatPrice } from '@/features/products/utils'

import type { MonthlySalesItem } from '../dashboard.types'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export const CHART_MONTHS = 6

export const CHART_MARGIN = { top: 12, right: 12, left: -4, bottom: 0 }

export function formatChartMonthLabel(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1] ?? String(month)
  return `${name} '${String(year).slice(-2)}`
}

export function formatFullMonthLabel(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1] ?? String(month)
  return `${name} ${year}`
}

export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`
  }
  if (abs >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}k`
  }
  return formatPrice(value)
}

export function fillMonthlySeries(
  data: MonthlySalesItem[],
  monthsCount = CHART_MONTHS,
): MonthlySalesItem[] {
  const now = new Date()
  const byKey = new Map(
    data.map((item) => [`${item.year}-${item.month}`, item] as const),
  )

  const series: MonthlySalesItem[] = []

  for (let offset = monthsCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const existing = byKey.get(`${year}-${month}`)

    series.push({
      year,
      month,
      monthLabel: formatChartMonthLabel(year, month),
      revenue: existing?.revenue ?? 0,
      orders: existing?.orders ?? 0,
    })
  }

  return series
}

export function hasChartActivity(data: MonthlySalesItem[]): boolean {
  return data.some((item) => item.revenue > 0 || item.orders > 0)
}

export function sumRevenue(data: MonthlySalesItem[]): number {
  return data.reduce((total, item) => total + item.revenue, 0)
}

export function sumOrders(data: MonthlySalesItem[]): number {
  return data.reduce((total, item) => total + item.orders, 0)
}
