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
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            ordersApi.util.updateQueryData('getOrderById', orderId, () => data),
          )
          dispatch(
            ordersApi.util.updateQueryData('getMyOrders', undefined, (draft) => {
              const index = draft.findIndex((entry) => entry._id === orderId)
              if (index !== -1) {
                draft[index] = data
              }
            }),
          )
        } catch {
          // invalidatesTags handles failed mutations
        }
      },
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
        'Payment',
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
