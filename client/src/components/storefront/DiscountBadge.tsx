import { Badge } from '@/components/ui/badge'
import { getDiscountPercent } from '@/features/products/utils'
import { cn } from '@/lib/utils'

interface DiscountBadgeProps {
  price: number
  discountPrice: number
  className?: string
}

export function DiscountBadge({ price, discountPrice, className }: DiscountBadgeProps) {
  const percent = getDiscountPercent(price, discountPrice)

  if (percent <= 0) return null

  return (
    <Badge
      className={cn(
        'rounded-sm bg-brand-deal px-1.5 py-0.5 text-[10px] font-semibold text-white',
        className,
      )}
    >
      {percent}% off
    </Badge>
  )
}
