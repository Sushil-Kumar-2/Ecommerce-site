import { Skeleton } from '@/components/ui/skeleton'
import { ProductCardSkeleton } from '@/features/products/components/ProductCardSkeleton'
import { cn } from '@/lib/utils'

interface ProductListingSkeletonProps {
  className?: string
}

export function ProductListingSkeleton({ className }: ProductListingSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <Skeleton className="mb-4 h-5 w-24" />
            <Skeleton className="mb-4 h-10 w-full" />
            <Skeleton className="mb-4 h-10 w-full" />
            <Skeleton className="mb-4 h-9 w-full" />
            <div className="space-y-4 border-t pt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
