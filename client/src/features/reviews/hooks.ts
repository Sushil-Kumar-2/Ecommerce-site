import { useGetProductReviewsQuery } from './reviewsApi'

export function useProductReviews(productId: string | undefined) {
  return useGetProductReviewsQuery(productId ?? '', {
    skip: !productId,
  })
}
