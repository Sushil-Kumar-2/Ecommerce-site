import type { UserRole } from '@/types/auth.types'
import type { Order } from '@/features/orders/order.types'

export interface AdminUser {
  _id: string
  name: string
  email: string
  phone?: string
  role: UserRole
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

export interface AdminUserFilters {
  page?: string
  limit?: string
  role?: 'user' | 'merchant' | 'admin'
  status?: 'active' | 'blocked' | 'pending'
  search?: string
}

export interface PaginatedAdminUsers {
  data: AdminUser[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminUserOrders = Order[]
