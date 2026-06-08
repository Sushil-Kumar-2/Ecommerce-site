import { baseApi } from '@/services/api'

import type { ProductReview } from './merchant-review.types'

export const merchantReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<ProductReview[], string>({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: (_result, _error, productId) => [
        { type: 'Review', id: productId },
      ],
    }),
  }),
})

export const { useGetProductReviewsQuery } = merchantReviewsApi
