import { baseApi } from '@/services/api'

import type {
  CreateRazorpayOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from './payment.types'
import type { Order } from '@/features/orders/order.types'

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<CreateRazorpayOrderResponse, string>({
      query: (orderId) => ({
        url: `/payments/create-order/${orderId}`,
        method: 'POST',
      }),
    }),
    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart', 'Order', 'Payment'],
    }),
    markPaymentFailed: builder.mutation<Order, string>({
      query: (orderId) => ({
        url: `/payments/failed/${orderId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Cart', 'Order', 'Payment'],
    }),
  }),
})

export const {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useMarkPaymentFailedMutation,
} = paymentsApi
