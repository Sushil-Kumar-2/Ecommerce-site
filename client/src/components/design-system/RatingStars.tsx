import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  totalReviews?: number
  className?: string
}

const sizeMap = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
} as const

export function RatingStars({
  rating,
  max = 5,
  size = 'sm',
  showValue = false,
  totalReviews,
  className,
}: RatingStarsProps) {
  const rounded = Math.round(rating)

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-label={`Rating: ${rating} out of ${max}`}
    >
      <div className="flex items-center" role="img">
        {Array.from({ length: max }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              sizeMap[size],
              index < rounded
                ? 'fill-rating text-rating'
                : 'fill-muted text-muted',
            )}
            aria-hidden
          />
        ))}
      </div>
      {showValue ? (
        <span className="text-xs font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      ) : null}
      {totalReviews !== undefined && totalReviews > 0 ? (
        <span className="text-xs text-brand-primary">
          {totalReviews.toLocaleString()}
        </span>
      ) : null}
    </div>
  )
}
