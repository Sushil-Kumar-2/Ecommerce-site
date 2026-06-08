export type CartItemAvailabilityStatus =
  | 'IN_STOCK'
  | 'OUT_OF_STOCK'
  | 'INSUFFICIENT_STOCK'

export interface EnrichedCartItem {
  productId: string
  quantity: number
  price: number
  variantName?: string
  variantValue?: string
  title: string
  image?: string
  availableStock: number
  is_available: boolean
  status: CartItemAvailabilityStatus
}

export interface EnrichedCartResponse {
  _id: string
  userId: string
  items: EnrichedCartItem[]
  totalAmount: number
  canCheckout: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AddToCartRequest {
  productId: string
  quantity: number
  variantName?: string
  variantValue?: string
}

export interface UpdateCartItemRequest {
  productId: string
  quantity: number
}
