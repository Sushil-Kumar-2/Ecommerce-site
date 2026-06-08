import { baseApi } from '@/services/api'

import type { Review } from './review.types'

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<Review[], string>({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: (_result, _error, productId) => [
        { type: 'Review', id: productId },
      ],
    }),
  }),
})

export const { useGetProductReviewsQuery } = reviewsApi
