import type { ProductVariant } from '@/features/products/product.types'

export interface MerchantProduct {
  _id: string
  title: string
  slug: string
  description: string
  categoryId: string
  merchantId: string
  images: string[]
  price: number
  stock: number
  discountPrice: number
  variants: ProductVariant[]
  averageRating: number
  totalReviews: number
  featured: boolean
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateMerchantProductRequest {
  title: string
  slug: string
  description: string
  categoryId: string
  price: number
  discountPrice?: number
  stock: number
  images?: string[]
  variants?: ProductVariant[]
}

export type UpdateMerchantProductRequest = Partial<CreateMerchantProductRequest>
