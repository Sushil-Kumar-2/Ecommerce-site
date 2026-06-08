export const MerchantFulfillmentStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  REJECTED: 'rejected',
} as const

export type MerchantFulfillmentStatus =
  (typeof MerchantFulfillmentStatus)[keyof typeof MerchantFulfillmentStatus]

export interface MerchantOrderItem {
  productId: string
  merchantId: string
  title: string
  image: string
  price: number
  quantity: number
  variantDetails?: string
}

export interface MerchantFulfillment {
  merchantId: string
  status: MerchantFulfillmentStatus
  acceptedAt?: string
  readyToShipAt?: string
  shippedAt?: string
  trackingNumber?: string
  carrier?: string
  rejectReason?: string
}

export interface MerchantShippingAddress {
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

export interface MerchantOrderView {
  orderId: string
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  shippingAddress: MerchantShippingAddress
  items: MerchantOrderItem[]
  merchantFulfillment: MerchantFulfillment
  merchantSubtotal: number
  createdAt: string
}

export interface PaginatedMerchantOrders {
  data: MerchantOrderView[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface MerchantOrderSummary {
  total: number
  pending: number
  accepted: number
  readyToShip: number
  shipped: number
  rejected: number
}

export interface MerchantOrderFilters {
  status?: MerchantFulfillmentStatus
  orderStatus?: string
  page?: string
  limit?: string
}

export interface ShipMerchantOrderRequest {
  orderId: string
  trackingNumber: string
  carrier?: string
}

export interface RejectMerchantOrderRequest {
  orderId: string
  reason: string
}
