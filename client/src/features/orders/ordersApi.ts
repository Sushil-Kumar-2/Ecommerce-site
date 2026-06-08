import { baseApi } from '@/services/api'

import type {
  CancelOrderRequest,
  CreateReturnRequest,
  Order,
  ReturnRequest,
} from './order.types'

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<Order[], void>({
      query: () => '/orders/my-orders',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Order' as const, id: _id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation<Order, CancelOrderRequest>({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
      ],
    }),
    createReturn: builder.mutation<ReturnRequest, CreateReturnRequest>({
      query: (body) => ({
        url: '/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Return', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useCreateReturnMutation,
} = ordersApi
