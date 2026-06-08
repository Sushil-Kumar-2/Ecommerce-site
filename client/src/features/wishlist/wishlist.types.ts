export interface WishlistItem {
  wishlistId: string
  productId: string
  title: string
  slug: string
  price: number
  discountPrice: number
  stock: number
  averageRating: number
  totalReviews: number
  image: string | null
  addedAt: string
}

export interface AddToWishlistRequest {
  productId: string
}

export interface RemoveFromWishlistResponse {
  success: boolean
  message: string
}
