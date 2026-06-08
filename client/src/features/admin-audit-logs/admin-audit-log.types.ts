export const AuditAction = {
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRICE_CHANGED: 'PRICE_CHANGED',
  STOCK_CHANGED: 'STOCK_CHANGED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  REFUND_APPROVED: 'REFUND_APPROVED',
  REFUND_COMPLETED: 'REFUND_COMPLETED',
  COUPON_CREATED: 'COUPON_CREATED',
  MERCHANT_REGISTERED: 'MERCHANT_REGISTERED',
  PRODUCT_REPORTED: 'PRODUCT_REPORTED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  MERCHANT_ACTIVATED: 'MERCHANT_ACTIVATED',
  MERCHANT_BLOCKED: 'MERCHANT_BLOCKED',
  PRODUCT_APPROVED: 'PRODUCT_APPROVED',
  PRODUCT_REJECTED: 'PRODUCT_REJECTED',
  PRODUCT_FEATURED: 'PRODUCT_FEATURED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  PRODUCT_REPORT_REVIEWED: 'PRODUCT_REPORT_REVIEWED',
  PRODUCT_REPORT_RESOLVED: 'PRODUCT_REPORT_RESOLVED',
} as const

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

export const AuditResource = {
  PRODUCT: 'product',
  ORDER: 'order',
  RETURN: 'return',
  COUPON: 'coupon',
  USER: 'user',
  CATEGORY: 'category',
  PROFILE: 'profile',
  PRODUCT_REPORT: 'product_report',
} as const

export type AuditResource = (typeof AuditResource)[keyof typeof AuditResource]

export interface AuditLog {
  _id: string
  userId?: string
  role: string
  action: AuditAction
  resource: string
  resourceId: string
  metadata: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt?: string
}

export interface AuditLogFilters {
  action?: AuditAction
  resource?: string
  userId?: string
  page?: string
  limit?: string
  from?: string
  to?: string
}

export interface PaginatedAuditLogs {
  data: AuditLog[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
