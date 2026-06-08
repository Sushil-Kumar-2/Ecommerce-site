import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useApplyCouponMutation,
  useCreateOrderMutation,
  useGetCheckoutPreviewQuery,
} from './checkoutApi'
import type { CheckoutPreviewParams, CreateOrderRequest } from './checkout.types'

export function useCheckoutPreview(params?: CheckoutPreviewParams) {
  const { isAuthenticated } = useAuth()

  return useGetCheckoutPreviewQuery(params ?? undefined, {
    skip: !isAuthenticated,
  })
}

export function usePlaceOrder() {
  const [createOrder, state] = useCreateOrderMutation()

  const placeOrder = async (payload: CreateOrderRequest) => {
    try {
      const result = await createOrder(payload).unwrap()
      toast.success(`Order ${result.order.orderNumber} placed successfully`)
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to place order.'))
      throw error
    }
  }

  return [placeOrder, state] as const
}

export function useApplyCoupon() {
  const [applyCoupon, state] = useApplyCouponMutation()

  const apply = async (code: string) => {
    try {
      const result = await applyCoupon({ code }).unwrap()
      toast.success(`Coupon ${result.code} applied`)
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to apply coupon.'))
      throw error
    }
  }

  return [apply, state] as const
}
