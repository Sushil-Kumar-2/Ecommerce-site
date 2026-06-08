import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  label?: string
}

export function LoadingSpinner({
  className,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-2', className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
