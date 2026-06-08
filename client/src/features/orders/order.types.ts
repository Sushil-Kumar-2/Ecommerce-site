export const PaymentMethod = {
  COD: 'cod',
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export interface OrderItem {
  productId: string
  merchantId: string
  title: string
  image: string
  price: number
  quantity: number
  variantDetails?: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  pincode: string
  landmark?: string
}

export interface Order {
  _id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  couponCode?: string
  shippingAddress: ShippingAddress
  subtotal: number
  shippingCharge: number
  discountAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  razorpayOrderId?: string
  razorpayPaymentId?: string
  paidAt?: string
  trackingNumber?: string
  estimatedDeliveryDate?: string
  cancelledAt?: string
  cancelReason?: string
  deliveredAt?: string
  shippedAt?: string
  outForDeliveryAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CancelOrderRequest {
  orderId: string
  reason: string
}

export interface CreateReturnRequest {
  orderId: string
  productId: string
  reason: string
}

export interface ReturnRequest {
  _id: string
  orderId: string
  productId: string
  userId: string
  reason: string
  status: string
  requestedAt?: string
  createdAt?: string
}

export interface OrderStatusStep {
  key: string
  label: string
  completed: boolean
  current: boolean
  timestamp?: string
}
