import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ProductCard } from '@/features/products/components/ProductCard'
import type { Product } from '@/features/products/product.types'
import { cn } from '@/lib/utils'

interface ProductRowProps {
  title: string
  products: Product[]
  viewAllHref?: string
  className?: string
}

const CARD_SCROLL_COUNT = 4

export function ProductRow({ title, products, viewAllHref, className }: ProductRowProps) {
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

  const scrollByCards = (direction: 'left' | 'right') => {
    const viewport = viewportRef.current
    if (!viewport) return

    const firstCard = viewport.querySelector<HTMLElement>('[data-product-card]')
    const cardWidth = firstCard?.offsetWidth ?? 200
    const gap = 12
    const distance = (cardWidth + gap) * CARD_SCROLL_COUNT

    viewport.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) return null

  return (
    <section className={cn('group/row space-y-3', className)}>
      <div className="flex items-center justify-between gap-4 px-4">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">{title}</h2>
        {viewAllHref ? (
          <Link
            to={viewAllHref}
            className="flex items-center gap-0.5 text-sm font-medium text-brand-primary hover:underline"
          >
            View all
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="relative px-4">
        {canScrollLeft ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Scroll left"
            className="absolute top-[calc(50%-1.5rem)] -left-0.5 z-20 size-10 rounded-full border-border bg-white shadow-md opacity-100 transition-opacity md:-left-1 md:opacity-0 md:group-hover/row:opacity-100"
            onClick={() => scrollByCards('left')}
          >
            <ChevronLeft className="size-5" />
          </Button>
        ) : null}

        {canScrollRight ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Scroll right"
            className="absolute top-[calc(50%-1.5rem)] -right-0.5 z-20 size-10 rounded-full border-border bg-white shadow-md opacity-100 transition-opacity md:-right-1 md:opacity-0 md:group-hover/row:opacity-100"
            onClick={() => scrollByCards('right')}
          >
            <ChevronRight className="size-5" />
          </Button>
        ) : null}

        <div
          ref={viewportRef}
          className="flex gap-3 overflow-x-auto py-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product._id}
              data-product-card
              className="w-[168px] shrink-0 sm:w-[200px]"
            >
              <ProductCard product={product} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
