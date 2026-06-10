import { useMemo } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { RatingStars } from '@/components/design-system'
import { StatusBadge } from '@/components/design-system/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/utils/api-error'

import { useProductReviews } from '../hooks'

interface ProductReviewsSectionProps {
  productId: string
  averageRating: number
  totalReviews: number
}

function ReviewsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]" aria-busy="true" aria-live="polite">
      <Skeleton className="h-48 rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function ProductReviewsSection({
  productId,
  averageRating,
  totalReviews,
}: ProductReviewsSectionProps) {
  const { data: reviews = [], isLoading, error, refetch } = useProductReviews(productId)

  const breakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((review) => review.rating === star).length
      const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
      return { star, count, percent }
    })
  }, [reviews])

  if (isLoading) {
    return <ReviewsSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Failed to load reviews.')}
        onRetry={() => void refetch()}
      />
    )
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Be the first to review this product after purchase."
      />
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div className="text-center">
          <p className="text-4xl font-semibold">{averageRating.toFixed(1)}</p>
          <RatingStars rating={averageRating} size="lg" />
          <p className="mt-1 text-sm text-muted-foreground">
            {totalReviews} review{totalReviews === 1 ? '' : 's'}
          </p>
        </div>
        <div className="space-y-2">
          {breakdown.map(({ star, count, percent }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-rating"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-6 text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <RatingStars rating={review.rating} />
              {review.isVerifiedPurchase ? (
                <StatusBadge status="verified" label="Verified purchase" variant="success" />
              ) : null}
            </div>
            {review.comment ? (
              <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
            ) : null}
            {review.images.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt=""
                    className="size-16 rounded-lg object-cover ring-1 ring-foreground/10"
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
