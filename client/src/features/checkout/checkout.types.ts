import type { EnrichedCartResponse } from '@/features/cart/cart.types'

export const PaymentMethod = {
  COD: 'cod',
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export type AddressSelectionMode = 'default' | 'explicit' | 'none'

export interface Address {
  _id: string
  userId: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  pincode: string
  landmark?: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CheckoutPreviewResponse {
  cart: EnrichedCartResponse | null
  addresses: Address[]
  selectedAddress: Address | null
  selectionMode: AddressSelectionMode
  canCheckout: boolean
  issues: string[]
}

export interface CreateOrderRequest {
  addressId?: string
  paymentMethod: PaymentMethod
  couponCode?: string
}

export interface Order {
  _id: string
  orderNumber: string
  userId: string
  subtotal: number
  shippingCharge: number
  discountAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: string
  orderStatus: string
  couponCode?: string
  createdAt?: string
}

export interface CreateOrderResponse {
  order: Order
  requiresPayment: boolean
}

export interface ApplyCouponRequest {
  code: string
}

export interface ApplyCouponResponse {
  couponId: string
  code: string
  discount: number
  finalAmount: number
}

export interface CheckoutPreviewParams {
  addressId?: string
}
