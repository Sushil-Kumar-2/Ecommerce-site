import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { OrderStatusStep } from '../order.types'
import { formatOrderDate } from '../utils'

interface OrderStatusTimelineProps {
  steps: OrderStatusStep[]
}

export function OrderStatusTimeline({ steps }: OrderStatusTimelineProps) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full border',
                step.completed
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted bg-muted text-muted-foreground',
                step.current && 'ring-2 ring-primary/30',
              )}
            >
              {step.completed ? <Check className="size-4" /> : index + 1}
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  'mt-1 w-px flex-1 min-h-6',
                  step.completed ? 'bg-primary' : 'bg-border',
                )}
              />
            ) : null}
          </div>
          <div className="pb-4">
            <p
              className={cn(
                'font-medium',
                step.current ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </p>
            {step.timestamp ? (
              <p className="text-sm text-muted-foreground">
                {formatOrderDate(step.timestamp)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
