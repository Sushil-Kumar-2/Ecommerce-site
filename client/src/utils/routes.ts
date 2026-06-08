import { UserRole, type UserRole as UserRoleType } from '@/types/auth.types'

export const ROUTES = {
  home: '/',
  products: '/products',
  catalog: '/products',
  account: '/account',
  productDetail: (id: string) => `/products/${id}`,
  cart: '/cart',
  wishlist: '/wishlist',
  checkout: '/checkout',
  addresses: '/account/addresses',
  addressNew: '/account/addresses/new',
  addressEdit: (id: string) => `/account/addresses/edit/${id}`,
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
  profile: '/profile',
  changePassword: '/profile/change-password',
  paymentSuccess: '/payment/success',
  paymentFailed: '/payment/failed',
  login: '/auth/login',
  register: '/auth/register',
  merchant: '/merchant',
  merchantProducts: '/merchant/products',
  merchantProductNew: '/merchant/products/new',
  merchantProductEdit: (id: string) => `/merchant/products/edit/${id}`,
  merchantOrders: '/merchant/orders',
  merchantOrderDetail: (id: string) => `/merchant/orders/${id}`,
  merchantInventory: '/merchant/inventory',
  merchantReviews: '/merchant/reviews',
  admin: '/admin',
  adminMerchants: '/admin/merchants',
  adminMerchantDetail: (id: string) => `/admin/merchants/${id}`,
  adminProducts: '/admin/products',
  adminProductDetail: (id: string) => `/admin/products/${id}`,
  adminCategories: '/admin/categories',
  adminCoupons: '/admin/coupons',
  adminUsers: '/admin/users',
  adminUserDetail: (id: string) => `/admin/users/${id}`,
  adminAuditLogs: '/admin/audit-logs',
  adminReports: '/admin/reports',
} as const

export function getDefaultRouteForRole(role: UserRoleType): string {
  switch (role) {
    case UserRole.MERCHANT:
      return ROUTES.merchant
    case UserRole.ADMIN:
      return ROUTES.admin
    case UserRole.USER:
    default:
      return ROUTES.home
  }
}
