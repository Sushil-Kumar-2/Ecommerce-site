import { useAuth } from '@/features/auth'
import { UserRole } from '@/types/auth.types'

import {
  useGetAdminDashboardQuery,
  useGetAdminMonthlyRevenueQuery,
  useGetMerchantDashboardQuery,
  useGetMerchantLowStockQuery,
  useGetMerchantMonthlySalesQuery,
} from './dashboardApi'

function useIsMerchant() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.role === UserRole.MERCHANT
}

export function useMerchantDashboard() {
  const isMerchant = useIsMerchant()
  return useGetMerchantDashboardQuery(undefined, { skip: !isMerchant })
}

export function useMerchantMonthlySales() {
  const isMerchant = useIsMerchant()
  return useGetMerchantMonthlySalesQuery(undefined, { skip: !isMerchant })
}

export function useMerchantLowStock() {
  const isMerchant = useIsMerchant()
  return useGetMerchantLowStockQuery(undefined, { skip: !isMerchant })
}

function useIsAdmin() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.role === UserRole.ADMIN
}

export function useAdminDashboard() {
  const isAdmin = useIsAdmin()
  return useGetAdminDashboardQuery(undefined, { skip: !isAdmin })
}

export function useAdminMonthlyRevenue() {
  const isAdmin = useIsAdmin()
  return useGetAdminMonthlyRevenueQuery(undefined, { skip: !isAdmin })
}
