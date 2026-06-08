import { baseApi } from '@/services/api'

import type {
  AddToCartRequest,
  EnrichedCartResponse,
  UpdateCartItemRequest,
} from './cart.types'

function recalculateTotal(items: EnrichedCartResponse['items']): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<EnrichedCartResponse | null, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<unknown, AddToCartRequest>({
      query: (body) => ({
        url: '/cart',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
      async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (!draft) return

            const existing = draft.items.find((item) => item.productId === productId)
            if (existing) {
              existing.quantity += quantity
            } else {
              draft.items.push({
                productId,
                quantity,
                price: 0,
                title: 'Adding...',
                availableStock: 0,
                is_available: true,
                status: 'IN_STOCK',
              })
            }

            draft.totalAmount = recalculateTotal(draft.items)
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    updateCartItem: builder.mutation<EnrichedCartResponse, UpdateCartItemRequest>({
      query: ({ productId, quantity }) => ({
        url: `/cart/item/${productId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
      async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (!draft) return

            const item = draft.items.find((entry) => entry.productId === productId)
            if (item) {
              item.quantity = quantity
            }

            draft.totalAmount = recalculateTotal(draft.items)
          }),
        )

        try {
          const { data } = await queryFulfilled
          dispatch(
            cartApi.util.updateQueryData('getCart', undefined, () => data),
          )
        } catch {
          patchResult.undo()
        }
      },
    }),
    removeCartItem: builder.mutation<EnrichedCartResponse, string>({
      query: (productId) => ({
        url: `/cart/item/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (!draft) return

            draft.items = draft.items.filter((item) => item.productId !== productId)
            draft.totalAmount = recalculateTotal(draft.items)
            draft.canCheckout = draft.items.length > 0 && draft.items.every((item) => item.is_available)
          }),
        )

        try {
          const { data } = await queryFulfilled
          dispatch(
            cartApi.util.updateQueryData('getCart', undefined, () => data),
          )
        } catch {
          patchResult.undo()
        }
      },
    }),
    clearCart: builder.mutation<unknown, void>({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (!draft) return

            draft.items = []
            draft.totalAmount = 0
            draft.canCheckout = false
          }),
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
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi
