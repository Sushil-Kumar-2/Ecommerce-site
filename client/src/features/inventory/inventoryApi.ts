import { baseApi } from '@/services/api'

import type { InventoryTransaction } from './inventory.types'

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryTransactions: builder.query<
      InventoryTransaction[],
      { productId: string; limit?: number }
    >({
      query: ({ productId, limit = 100 }) =>
        `/inventory/products/${productId}/transactions?limit=${limit}`,
      providesTags: (_result, _error, { productId }) => [
        { type: 'Inventory', id: productId },
      ],
    }),
  }),
})

export const { useGetInventoryTransactionsQuery } = inventoryApi
