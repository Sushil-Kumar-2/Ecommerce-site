export const ProductReportStatus = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
} as const

export type ProductReportStatus =
  (typeof ProductReportStatus)[keyof typeof ProductReportStatus]

export interface ProductReportProduct {
  _id: string
  title: string
  images: string[]
  status: string
}

export interface ProductReportReporter {
  _id: string
  name: string
  email: string
}

export interface ProductReport {
  _id: string
  userId: string
  productId: string
  reason: string
  status: ProductReportStatus
  product: ProductReportProduct | null
  reporter: ProductReportReporter | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductReportFilters {
  page?: string
  limit?: string
  status?: ProductReportStatus
}

export interface PaginatedProductReports {
  data: ProductReport[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
