import { baseApi } from '@/services/api'

import type {
  MerchantOrderFilters,
  MerchantOrderSummary,
  MerchantOrderView,
  PaginatedMerchantOrders,
  RejectMerchantOrderRequest,
  ShipMerchantOrderRequest,
} from './merchant-order.types'

function buildOrderQuery(filters?: MerchantOrderFilters): string {
  if (!filters) return '/merchant/orders'
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const query = params.toString()
  return query ? `/merchant/orders?${query}` : '/merchant/orders'
}

export const merchantOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMerchantOrders: builder.query<PaginatedMerchantOrders, MerchantOrderFilters | void>({
      query: (filters) => buildOrderQuery(filters ?? undefined),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ orderId }) => ({
                type: 'Order' as const,
                id: orderId,
              })),
              { type: 'Order', id: 'MERCHANT_LIST' },
            ]
          : [{ type: 'Order', id: 'MERCHANT_LIST' }],
    }),
    getMerchantOrderById: builder.query<MerchantOrderView, string>({
      query: (id) => `/merchant/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    getMerchantOrderSummary: builder.query<MerchantOrderSummary, void>({
      query: () => '/merchant/orders/summary',
      providesTags: ['Order'],
    }),
    acceptMerchantOrder: builder.mutation<MerchantOrderView, string>({
      query: (orderId) => ({
        url: `/merchant/orders/${orderId}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, orderId) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'MERCHANT_LIST' },
        'Dashboard',
      ],
    }),
    readyToShipMerchantOrder: builder.mutation<MerchantOrderView, string>({
      query: (orderId) => ({
        url: `/merchant/orders/${orderId}/ready-to-ship`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, orderId) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'MERCHANT_LIST' },
        'Dashboard',
      ],
    }),
    shipMerchantOrder: builder.mutation<MerchantOrderView, ShipMerchantOrderRequest>({
      query: ({ orderId, trackingNumber, carrier }) => ({
        url: `/merchant/orders/${orderId}/ship`,
        method: 'PATCH',
        body: { trackingNumber, carrier },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'MERCHANT_LIST' },
        'Dashboard',
      ],
    }),
    rejectMerchantOrder: builder.mutation<MerchantOrderView, RejectMerchantOrderRequest>({
      query: ({ orderId, reason }) => ({
        url: `/merchant/orders/${orderId}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'MERCHANT_LIST' },
        'Dashboard',
      ],
    }),
  }),
})

export const {
  useGetMerchantOrdersQuery,
  useGetMerchantOrderByIdQuery,
  useGetMerchantOrderSummaryQuery,
  useAcceptMerchantOrderMutation,
  useReadyToShipMerchantOrderMutation,
  useShipMerchantOrderMutation,
  useRejectMerchantOrderMutation,
} = merchantOrdersApi
