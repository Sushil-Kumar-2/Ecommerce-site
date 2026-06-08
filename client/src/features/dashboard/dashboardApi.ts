import { baseApi } from '@/services/api'

import type {
  AdminDashboardResponse,
  AdminMonthlyRevenueItem,
  LowStockProduct,
  MerchantDashboardResponse,
  MonthlySalesItem,
} from './dashboard.types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMerchantDashboard: builder.query<MerchantDashboardResponse, void>({
      query: () => '/dashboard/merchant',
      providesTags: ['Dashboard'],
    }),
    getMerchantMonthlySales: builder.query<MonthlySalesItem[], void>({
      query: () => '/dashboard/merchant/monthly-sales',
      providesTags: ['Dashboard'],
    }),
    getMerchantLowStock: builder.query<LowStockProduct[], void>({
      query: () => '/dashboard/merchant/low-stock',
      providesTags: ['Dashboard'],
    }),
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => '/dashboard/admin',
      providesTags: ['Dashboard'],
    }),
    getAdminMonthlyRevenue: builder.query<AdminMonthlyRevenueItem[], void>({
      query: () => '/dashboard/admin/monthly-revenue',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetMerchantDashboardQuery,
  useGetMerchantMonthlySalesQuery,
  useGetMerchantLowStockQuery,
  useGetAdminDashboardQuery,
  useGetAdminMonthlyRevenueQuery,
} = dashboardApi
