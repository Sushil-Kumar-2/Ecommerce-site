export interface MerchantUser {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  avatar?: string
  shopLogo?: string
  shopName?: string
  shopDescription?: string
  gstNumber?: string
  businessAddress?: string
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MerchantFilters {
  page?: string
  limit?: string
  status?: 'active' | 'blocked' | 'pending'
  search?: string
}

export interface PaginatedMerchants {
  data: MerchantUser[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
