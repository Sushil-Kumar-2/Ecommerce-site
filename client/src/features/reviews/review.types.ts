export interface Review {
  _id: string
  userId: string
  productId: string
  orderId: string
  rating: number
  comment?: string
  images: string[]
  isVerifiedPurchase: boolean
  createdAt?: string
}
