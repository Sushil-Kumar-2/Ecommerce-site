import { baseApi } from '@/services/api'

import type {
  AddToWishlistRequest,
  RemoveFromWishlistResponse,
  WishlistItem,
} from './wishlist.types'

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistItem[], void>({
      query: () => '/wishlists',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<unknown, AddToWishlistRequest>({
      query: (body) => ({
        url: '/wishlists',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wishlist'],
      async onQueryStarted({ productId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
            if (draft.some((item) => item.productId === productId)) return

            draft.unshift({
              wishlistId: `temp-${productId}`,
              productId,
              title: 'Adding...',
              slug: '',
              price: 0,
              discountPrice: 0,
              stock: 0,
              averageRating: 0,
              totalReviews: 0,
              image: null,
              addedAt: new Date().toISOString(),
            })
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    removeFromWishlist: builder.mutation<RemoveFromWishlistResponse, string>({
      query: (productId) => ({
        url: `/wishlists/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) =>
            draft.filter((item) => item.productId !== productId),
          ),
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi
