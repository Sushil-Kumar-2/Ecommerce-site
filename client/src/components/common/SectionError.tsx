import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SectionErrorProps {
  message?: string
  onRetry?: () => void
}

export function SectionError({
  message = 'Failed to load this section.',
  onRetry,
}: SectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
