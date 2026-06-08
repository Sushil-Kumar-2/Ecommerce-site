import { Skeleton } from '@/components/ui/skeleton'

import type { Product } from '../product.types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products?: Product[]
  isLoading?: boolean
  skeletonCount?: number
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {(products ?? []).map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-border/60">
      <Skeleton className="h-40 w-full rounded-none sm:h-44" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  )
}

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
