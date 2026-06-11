import { Link } from 'react-router-dom'
import { ChevronRight, ImageOff } from 'lucide-react'

import { RatingStars } from '@/components/design-system'
import type { Product } from '@/features/products/product.types'
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  getProductImage,
  getProductRoute,
} from '@/features/products/utils'
import { cn } from '@/lib/utils'

import { HorizontalScrollRail } from './HorizontalScrollRail'
import { useHorizontalScroll } from './useHorizontalScroll'

interface ProductImageStripProps {
  title: string
  products: Product[]
  viewAllHref?: string
  className?: string
}

const CARD_SCROLL_COUNT = 3

function StripProductTile({ product }: { product: Product }) {
  const image = getProductImage(product.images)
  const effectivePrice = getEffectivePrice(product.price, product.discountPrice)
  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price
  const discountPercent = getDiscountPercent(product.price, product.discountPrice)

  return (
    <Link
      to={getProductRoute(product._id)}
      data-strip-card
      className="group/tile flex w-[148px] shrink-0 flex-col sm:w-[168px] md:w-[184px]"
    >
      <div className="relative overflow-hidden rounded-md bg-muted/40 ring-1 ring-border/50 transition-shadow group-hover/tile:shadow-md">
        <div className="aspect-square">
          {image ? (
            <img
              src={image}
              alt={product.title}
              className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageOff className="size-7 opacity-40" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
        </div>

        {hasDiscount ? (
          <span className="absolute top-2 left-2 rounded-sm bg-brand-deal px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {discountPercent}% off
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-1 px-0.5">
        <h3 className="line-clamp-2 text-xs leading-snug text-foreground transition-colors group-hover/tile:text-brand-primary sm:text-[13px]">
          {product.title}
        </h3>

        {product.totalReviews > 0 ? (
          <RatingStars
            rating={product.averageRating}
            size="sm"
            showValue
            totalReviews={product.totalReviews}
            className="text-[10px]"
          />
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pt-0.5">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount ? (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export function ProductImageStrip({
  title,
  products,
  viewAllHref,
  className,
}: ProductImageStripProps) {
  const {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft,
    scrollRight,
  } = useHorizontalScroll(products.length, {
    cardSelector: '[data-strip-card]',
    cardScrollCount: CARD_SCROLL_COUNT,
  })

  if (products.length === 0) return null

  return (
    <section
      className={cn(
        'group/strip overflow-hidden rounded-sm bg-card shadow-sm ring-1 ring-border/40',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 sm:px-5">
        <h2 className="font-heading text-base font-semibold sm:text-lg">{title}</h2>
        {viewAllHref ? (
          <Link
            to={viewAllHref}
            className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-brand-primary hover:underline"
          >
            See more
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="px-2 py-4 sm:px-3 sm:py-4 md:px-4">
        <HorizontalScrollRail
          viewportRef={viewportRef}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          hasOverflow={hasOverflow}
          onScrollLeft={scrollLeft}
          onScrollRight={scrollRight}
          viewportClassName="flex gap-3 py-0.5"
        >
          {products.map((product) => (
            <StripProductTile key={product._id} product={product} />
          ))}
        </HorizontalScrollRail>
      </div>
    </section>
  )
}
