import { BadgeCheck, RotateCcw, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

const badges = [
  {
    icon: ShieldCheck,
    label: 'Secure payment',
  },
  {
    icon: RotateCcw,
    label: 'Easy returns',
  },
  {
    icon: BadgeCheck,
    label: 'Genuine products',
  },
] as const

interface TrustBadgesProps {
  className?: string
}

export function TrustBadges({ className }: TrustBadgesProps) {
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
