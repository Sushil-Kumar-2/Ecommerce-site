import { cn } from '@/lib/utils'

export const typography = {
  display: 'font-heading text-4xl font-bold tracking-tight',
  h1: 'font-heading text-2xl font-semibold tracking-tight',
  h2: 'font-heading text-lg font-semibold',
  body: 'text-sm',
  caption: 'text-xs text-muted-foreground',
  micro: 'text-[0.6875rem] font-medium',
} as const

export function textClass(
  variant: keyof typeof typography,
  className?: string,
) {
  return cn(typography[variant], className)
}
