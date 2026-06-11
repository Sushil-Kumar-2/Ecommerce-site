import { Link } from 'react-router-dom'

import { ChevronRight } from 'lucide-react'



import { ProductCard } from '@/features/products/components/ProductCard'

import type { Product } from '@/features/products/product.types'

import { cn } from '@/lib/utils'



import { HorizontalScrollRail } from './HorizontalScrollRail'

import { useHorizontalScroll } from './useHorizontalScroll'



interface ProductRowProps {

  title: string

  products: Product[]

  categoryMap?: Record<string, string>

  viewAllHref?: string

  className?: string

}



const CARD_SCROLL_COUNT = 4



export function ProductRow({

  title,

  products,

  categoryMap = {},

  viewAllHref,

  className,

}: ProductRowProps) {

  const {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft,
    scrollRight,
  } = useHorizontalScroll(products.length, {
    cardSelector: '[data-product-card]',
    cardScrollCount: CARD_SCROLL_COUNT,
  })



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



      <div className="px-2 sm:px-3 md:px-4">

        <HorizontalScrollRail

          viewportRef={viewportRef}

          canScrollLeft={canScrollLeft}

          canScrollRight={canScrollRight}

          hasOverflow={hasOverflow}

          onScrollLeft={scrollLeft}

          onScrollRight={scrollRight}

          viewportClassName="flex gap-3 py-1"

        >

          {products.map((product) => (

            <div

              key={product._id}

              data-product-card

              className="w-[200px] shrink-0 sm:w-[220px] md:w-[240px]"

            >

              <ProductCard

                product={product}

                categoryName={categoryMap[product.categoryId]}

                density="compact"

                className="h-full"

              />

            </div>

          ))}

        </HorizontalScrollRail>

      </div>

    </section>

  )

}

