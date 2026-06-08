import { baseApi } from '@/services/api'

export interface RecentlyViewedItem {
  productId: string
  title: string
  slug: string
  image: string | null
  price: number
  discountPrice: number
  stock: number
  averageRating: number
  totalReviews: number
  viewedAt: string
}

export const recentlyViewedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecentlyViewed: builder.query<RecentlyViewedItem[], void>({
      query: () => '/recently-viewed',
      providesTags: ['RecentlyViewed'],
    }),
  }),
})

export const { useGetRecentlyViewedQuery } = recentlyViewedApi
