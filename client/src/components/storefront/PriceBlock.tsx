import { formatPrice, getDiscountPercent, getEffectivePrice } from '@/features/products/utils'
import { cn } from '@/lib/utils'

import { DiscountBadge } from './DiscountBadge'

interface PriceBlockProps {
  price: number
  discountPrice: number
  size?: 'sm' | 'lg'
  className?: string
  showSavings?: boolean
  showDiscountBadge?: boolean
}

export function PriceBlock({
  price,
  discountPrice,
  size = 'sm',
  className,
  showSavings = true,
  showDiscountBadge = true,
}: PriceBlockProps) {
  const effectivePrice = getEffectivePrice(price, discountPrice)
  const hasDiscount = discountPrice > 0 && discountPrice < price
  const savings = hasDiscount ? price - discountPrice : 0
  const percent = getDiscountPercent(price, discountPrice)

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            'font-semibold text-foreground',
            size === 'lg' ? 'text-2xl' : 'text-base',
          )}
        >
          {formatPrice(effectivePrice)}
        </span>
        {hasDiscount ? (
          <>
            <span
              className={cn(
                'text-muted-foreground line-through',
                size === 'lg' ? 'text-sm' : 'text-xs',
              )}
            >
              {size === 'lg' ? `MRP ${formatPrice(price)}` : formatPrice(price)}
            </span>
            {showDiscountBadge ? (
              <DiscountBadge price={price} discountPrice={discountPrice} />
            ) : null}
          </>
        ) : null}
      </div>
      {showSavings && hasDiscount && savings > 0 ? (
        <p className={cn('font-medium text-brand-deal', size === 'lg' ? 'text-sm' : 'text-xs')}>
          You save {formatPrice(savings)} ({percent}%)
        </p>
      ) : null}
    </div>
  )
}
