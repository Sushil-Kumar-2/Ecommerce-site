import { Badge } from '@/components/ui/badge'
import type { Product } from '@/features/products/product.types'
import {
  getDiscountPercent,
  getProductBadges,
  type ProductBadge,
} from '@/features/products/utils'
import { cn } from '@/lib/utils'

const BADGE_CONFIG: Record<
  ProductBadge,
  { label: (product: Product) => string; className: string }
> = {
  featured: {
    label: () => 'Featured',
    className: 'bg-brand-accent/90 text-foreground border-transparent shadow-sm',
  },
  discount: {
    label: (product) => `-${getDiscountPercent(product.price, product.discountPrice)}%`,
    className: 'bg-brand-deal text-white border-transparent shadow-sm',
  },
  new: {
    label: () => 'New',
    className: 'bg-status-info text-status-info-foreground border-transparent shadow-sm',
  },
  topRated: {
    label: () => 'Top Rated',
    className: 'bg-rating text-white border-transparent shadow-sm',
  },
}

const LEFT_BADGES: ProductBadge[] = ['featured', 'new', 'topRated']
const RIGHT_BADGES: ProductBadge[] = ['discount']

function BadgePill({
  badge,
  product,
}: {
  badge: ProductBadge
  product: Product
}) {
  const config = BADGE_CONFIG[badge]
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide',
        config.className,
      )}
    >
      {config.label(product)}
    </Badge>
  )
}

interface ProductBadgeStackProps {
  product: Product
  className?: string
  layout?: 'stack' | 'overlay'
}

export function ProductBadgeStack({
  product,
  className,
  layout = 'stack',
}: ProductBadgeStackProps) {
  const badges = getProductBadges(product)

  if (badges.length === 0) return null

  if (layout === 'overlay') {
    const left = badges.filter((badge) => LEFT_BADGES.includes(badge))
    const right = badges.filter((badge) => RIGHT_BADGES.includes(badge))

    return (
      <>
        {left.length > 0 ? (
          <div className={cn('absolute top-2 left-2 z-10 flex flex-col gap-1', className)}>
            {left.map((badge) => (
              <BadgePill key={badge} badge={badge} product={product} />
            ))}
          </div>
        ) : null}
        {right.length > 0 ? (
          <div className="absolute top-2 right-11 z-10 flex flex-col items-end gap-1">
            {right.map((badge) => (
              <BadgePill key={badge} badge={badge} product={product} />
            ))}
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges.map((badge) => (
        <BadgePill key={badge} badge={badge} product={product} />
      ))}
    </div>
  )
}
