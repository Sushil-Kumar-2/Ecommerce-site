import { useMemo, useState } from 'react'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { RatingStars } from '@/components/design-system'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useMerchantReviews,
  type MerchantReviewItem,
} from '@/features/merchant-reviews'
import { formatOrderDate } from '@/features/orders'
import { getApiErrorMessage } from '@/utils/api-error'

export function MerchantReviewsPage() {
  const { reviews, isLoading, error, refetch } = useMerchantReviews()
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')

  const filtered = useMemo(() => {
    if (ratingFilter === 'all') return reviews
    return reviews.filter((review) => review.rating === ratingFilter)
  }, [reviews, ratingFilter])

  if (error) {
    return (
      <PageContainer title="Reviews">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load reviews.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Reviews" description="Customer feedback on your products.">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={ratingFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRatingFilter('all')}
        >
          All
        </Button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={ratingFilter === rating ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRatingFilter(rating)}
          >
            {rating} stars
          </Button>
        ))}
      </div>

      <DataTable<MerchantReviewItem>
        columns={[
          {
            key: 'product',
            header: 'Product',
            cell: (row) => row.productTitle,
          },
          {
            key: 'rating',
            header: 'Rating',
            cell: (row) => <RatingStars rating={row.rating} />,
          },
          {
            key: 'comment',
            header: 'Comment',
            cell: (row) => (
              <span className="max-w-xs truncate">{row.comment ?? '—'}</span>
            ),
          },
          {
            key: 'images',
            header: 'Images',
            cell: (row) =>
              row.images.length > 0 ? (
                <div className="flex gap-1">
                  {row.images.slice(0, 3).map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="size-8 rounded object-cover"
                    />
                  ))}
                </div>
              ) : (
                '—'
              ),
          },
          {
            key: 'verified',
            header: 'Verified',
            cell: (row) =>
              row.isVerifiedPurchase ? (
                <Badge variant="secondary">Verified purchase</Badge>
              ) : (
                '—'
              ),
          },
          {
            key: 'date',
            header: 'Date',
            cell: (row) => formatOrderDate(row.createdAt),
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="No reviews yet"
        getRowKey={(row) => row._id}
      />
    </PageContainer>
  )
}
