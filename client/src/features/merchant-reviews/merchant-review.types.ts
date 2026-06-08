export interface ProductReview {
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

export interface MerchantReviewItem extends ProductReview {
  productTitle: string
}
