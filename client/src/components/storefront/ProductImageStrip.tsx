import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

import { RatingStars } from '@/components/design-system'
import { Button } from '@/components/ui/button'
import type { Product } from '@/features/products/product.types'
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  getProductImage,
  getProductRoute,
} from '@/features/products/utils'
import { cn } from '@/lib/utils'

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
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const { scrollLeft, scrollWidth, clientWidth } = viewport
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    updateScrollState()
    viewport.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      viewport.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [products, updateScrollState])

  const scroll = (direction: 'left' | 'right') => {
    const viewport = viewportRef.current
    if (!viewport) return

    const firstCard = viewport.querySelector<HTMLElement>('[data-strip-card]')
    const cardWidth = firstCard?.offsetWidth ?? 168
    const gap = 12
    const distance = (cardWidth + gap) * CARD_SCROLL_COUNT

    viewport.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    })
  }

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

      <div className="relative px-4 py-4 sm:px-5">
        {canScrollLeft ? (
          <>
            <div
              className="pointer-events-none absolute top-0 bottom-0 left-0 z-[5] w-10 bg-gradient-to-r from-card to-transparent sm:w-14"
              aria-hidden
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Scroll left"
              className="absolute top-1/2 left-1 z-10 hidden size-10 -translate-y-1/2 rounded-full border-border bg-background shadow-md sm:flex md:opacity-0 md:transition-opacity md:group-hover/strip:opacity-100"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="size-5" />
            </Button>
          </>
        ) : null}

        {canScrollRight ? (
          <>
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0 z-[5] w-10 bg-gradient-to-l from-card to-transparent sm:w-14"
              aria-hidden
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Scroll right"
              className="absolute top-1/2 right-1 z-10 hidden size-10 -translate-y-1/2 rounded-full border-border bg-background shadow-md sm:flex md:opacity-0 md:transition-opacity md:group-hover/strip:opacity-100"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        ) : null}

        <div
          ref={viewportRef}
          className="flex gap-3 overflow-x-auto scroll-smooth py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <StripProductTile key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
