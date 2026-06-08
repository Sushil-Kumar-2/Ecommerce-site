import type { ProductVariant } from '@/features/products/product.types'

export interface AdminProductCategory {
  _id: string
  name: string
  slug: string
}

export interface AdminProductMerchant {
  _id: string
  name: string
  email: string
  shopName?: string
}

export interface AdminProduct {
  _id: string
  title: string
  slug: string
  description: string
  categoryId: string | AdminProductCategory
  merchantId: string | AdminProductMerchant
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

export interface AdminProductFilters {
  page?: string
  limit?: string
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
  featured?: boolean
  search?: string
}

export interface PaginatedAdminProducts {
  data: AdminProduct[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface RejectProductRequest {
  id: string
  reason?: string
}
