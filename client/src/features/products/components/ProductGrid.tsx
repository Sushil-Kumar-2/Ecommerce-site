import { Skeleton } from '@/components/ui/skeleton'

import type { Product } from '../product.types'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'

interface ProductGridProps {
  products?: Product[]
  isLoading?: boolean
  skeletonCount?: number
  categoryMap?: Record<string, string>
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  categoryMap = {},
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
      {(products ?? []).map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          categoryName={categoryMap[product.categoryId]}
          className="h-full"
        />
      ))}
    </div>
  )
}

export { ProductCardSkeleton } from './ProductCardSkeleton'

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
