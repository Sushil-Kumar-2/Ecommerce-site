import type { Order } from '@/features/orders/order.types'

export interface CreateRazorpayOrderResponse {
  key: string
  orderId: string
  razorpayOrderId: string
  amount: number
  currency: string
}

export interface VerifyPaymentRequest {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  order: Order
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void
  modal?: {
    ondismiss?: () => void
  }
  prefill?: {
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayFailedResponse {
  error?: {
    code?: string
    description?: string
    reason?: string
  }
}
