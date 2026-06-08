import { baseApi } from '@/services/api'

import type {
  ApplyCouponRequest,
  ApplyCouponResponse,
  CheckoutPreviewParams,
  CheckoutPreviewResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from './checkout.types'

function buildCheckoutQuery(params?: CheckoutPreviewParams): string {
  if (!params?.addressId) return '/checkout'

  const search = new URLSearchParams({ addressId: params.addressId })
  return `/checkout?${search.toString()}`
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCheckoutPreview: builder.query<CheckoutPreviewResponse, CheckoutPreviewParams | void>({
      query: (params) => buildCheckoutQuery(params ?? undefined),
      providesTags: ['Cart', 'Order'],
    }),
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    applyCoupon: builder.mutation<ApplyCouponResponse, ApplyCouponRequest>({
      query: (body) => ({
        url: '/coupons/apply',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetCheckoutPreviewQuery,
  useCreateOrderMutation,
  useApplyCouponMutation,
} = checkoutApi
