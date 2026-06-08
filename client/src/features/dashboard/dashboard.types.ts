export interface TopProductItem {
  _id: string
  title: string
  totalSold: number
  revenue: number
}

export interface MerchantDashboardResponse {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  topProducts: TopProductItem[]
}

export interface MonthlySalesItem {
  year: number
  month: number
  monthLabel: string
  revenue: number
  orders: number
}

export interface LowStockProduct {
  _id: string
  title: string
  stock: number
}

export interface AdminOverviewMetrics {
  totalUsers: number
  totalMerchants: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  refundedOrders: number
}

export interface AdminMonthlyRevenueItem {
  year: number
  month: number
  monthLabel: string
  revenue: number
  orders: number
}

export interface AdminTopProductItem {
  productId: string
  title: string
  totalSold: number
  revenue: number
}

export interface AdminTopMerchantItem {
  merchantId: string
  merchantName: string
  shopName: string | null
  totalOrders: number
  totalSold: number
  revenue: number
}

export interface AdminTopCategoryItem {
  categoryId: string
  categoryName: string
  totalSold: number
  revenue: number
}

export interface AdminDashboardResponse {
  overview: AdminOverviewMetrics
  monthlyRevenue: AdminMonthlyRevenueItem[]
  topProducts: AdminTopProductItem[]
  topMerchants: AdminTopMerchantItem[]
  topCategories: AdminTopCategoryItem[]
}
