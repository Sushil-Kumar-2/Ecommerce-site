import { cva, type VariantProps } from 'class-variance-authority'

import { formatStatus, getStatusVariant } from '@/lib/status'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        success:
          'border-status-success bg-status-success text-status-success-foreground',
        warning:
          'border-status-warning bg-status-warning text-status-warning-foreground',
        info: 'border-status-info bg-status-info text-status-info-foreground',
        pending:
          'border-status-pending bg-status-pending text-status-pending-foreground',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive',
        neutral: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

interface StatusBadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof statusBadgeVariants> {
  status: string
  label?: string
}

export function StatusBadge({
  status,
  label,
  variant,
  className,
  ...props
}: StatusBadgeProps) {
  const resolvedVariant = variant ?? getStatusVariant(status)

  return (
    <span
      className={cn(statusBadgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {label ?? formatStatus(status)}
    </span>
  )
}
