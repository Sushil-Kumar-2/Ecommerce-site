export const ProductSort = {
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  TOP_RATED: 'top_rated',
} as const

export type ProductSort = (typeof ProductSort)[keyof typeof ProductSort]

export interface ProductVariant {
  name: string
  value: string
  stock: number
}

export interface Product {
  _id: string
  title: string
  slug: string
  description: string
  categoryId: string
  merchantId: string
  images: string[]
  price: number
  stock: number
  version?: number
  discountPrice: number
  variants: ProductVariant[]
  averageRating: number
  totalReviews: number
  featured: boolean
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductFilterParams {
  search?: string
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  minRating?: string
  sort?: ProductSort
  page?: string
  limit?: string
  featured?: string
  inStock?: string
  status?: string
  merchantId?: string
}

export interface ProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListFilters {
  search: string | null
  minPrice: string | null
  maxPrice: string | null
  rating: string | null
  sort: ProductSort
  categoryId: string | null
  inStock: string | null
  featured: string | null
}

export interface ProductListResponse {
  data: Product[]
  pagination: ProductPagination
  filters: ProductListFilters
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentCategory?: string
  status?: 'active' | 'inactive'
  isActive: boolean
}
