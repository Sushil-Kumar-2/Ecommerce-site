export const DiscountType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]

export interface AdminCoupon {
  _id: string
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minimumOrderAmount: number
  maximumDiscountAmount?: number
  startDate: string
  expiryDate: string
  isActive: boolean
  usageCount: number
  usageLimit?: number
  usedBy: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CouponFilters {
  page?: string
  limit?: string
  isActive?: string
}

export interface PaginatedCoupons {
  data: AdminCoupon[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateCouponRequest {
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minimumOrderAmount?: number
  maximumDiscountAmount?: number
  startDate: string
  expiryDate: string
  isActive?: boolean
  usageLimit?: number
}

export type UpdateCouponRequest = Partial<CreateCouponRequest>

export interface CouponStats {
  usageCount: number
  usageLimit: number | null
  usedByCount: number
}
