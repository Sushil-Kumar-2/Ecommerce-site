import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProductCardSkeletonProps {
  layout?: 'grid' | 'list'
  className?: string
}

export function ProductCardSkeleton({ layout = 'grid', className }: ProductCardSkeletonProps) {
  const isList = layout === 'list'

  if (isList) {
    return (
      <div
        className={cn(
          'flex gap-4 overflow-hidden rounded-xl border bg-card p-3 shadow-sm',
          className,
        )}
      >
        <Skeleton className="aspect-square w-28 shrink-0 rounded-lg sm:w-36" />
        <div className="flex flex-1 flex-col gap-2 py-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-28" />
          <div className="mt-auto flex gap-2 pt-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm',
        className,
      )}
    >
      <Skeleton className="min-h-[260px] w-full flex-[7] rounded-none" />
      <div className="flex flex-[3] flex-col gap-2.5 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3.5 w-28" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </div>
    </div>
  )
}
