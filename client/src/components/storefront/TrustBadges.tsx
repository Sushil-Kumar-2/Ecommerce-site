import { BadgeCheck, RotateCcw, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

const badges = [
  {
    icon: ShieldCheck,
    label: 'Secure payment',
    description: 'Encrypted checkout',
  },
  {
    icon: RotateCcw,
    label: 'Easy returns',
    description: '7-day return policy',
  },
  {
    icon: BadgeCheck,
    label: 'Genuine products',
    description: '100% authentic',
  },
] as const

interface TrustBadgesProps {
  className?: string
  variant?: 'inline' | 'grid'
}

export function TrustBadges({ className, variant = 'inline' }: TrustBadgesProps) {
  if (variant === 'grid') {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-3 sm:grid-cols-3',
          className,
        )}
      >
        {badges.map(({ icon: Icon, label, description }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
              <Icon className="size-4 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm',
        className,
      )}
    >
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon className="size-4 shrink-0 text-brand-primary" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
