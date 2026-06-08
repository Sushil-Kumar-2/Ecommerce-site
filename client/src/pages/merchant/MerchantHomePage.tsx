import { Link } from 'react-router-dom'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Skeleton } from '@/components/ui/skeleton'
import {
  OrdersChart,
  RevenueChart,
  StatCard,
  useMerchantDashboard,
  useMerchantLowStock,
  useMerchantMonthlySales,
} from '@/features/dashboard'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

export function MerchantHomePage() {
  const {
    data: dashboard,
    error: dashboardError,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useMerchantDashboard()
  const {
    data: monthlySales = [],
    error: salesError,
    isLoading: isSalesLoading,
    refetch: refetchSales,
  } = useMerchantMonthlySales()
  const {
    data: lowStock = [],
    error: lowStockError,
    refetch: refetchLowStock,
  } = useMerchantLowStock()

  const isLoading = isDashboardLoading || isSalesLoading
  const error = dashboardError ?? salesError

  if (isLoading) {
    return (
      <PageContainer
        title="Merchant Dashboard"
        description="Manage your products, orders, and inventory."
      >
        <DashboardSkeleton />
      </PageContainer>
    )
  }

  if (error || !dashboard) {
    return (
      <PageContainer
        title="Merchant Dashboard"
        description="Manage your products, orders, and inventory."
      >
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load dashboard.')}
          onRetry={() => {
            void refetchDashboard()
            void refetchSales()
          }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Merchant Dashboard"
      description="Manage your products, orders, and inventory."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Products" value={dashboard.totalProducts} />
          <StatCard title="Total Orders" value={dashboard.totalOrders} />
          <StatCard title="Pending Orders" value={dashboard.pendingOrders} />
          <StatCard title="Delivered Orders" value={dashboard.deliveredOrders} />
          <StatCard title="Revenue" value={formatPrice(dashboard.totalRevenue)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={monthlySales} />
          <OrdersChart data={monthlySales} />
        </div>

        {lowStockError ? (
          <ErrorState
            message={getApiErrorMessage(lowStockError, 'Failed to load low stock alerts.')}
            onRetry={() => void refetchLowStock()}
          />
        ) : null}

        {!lowStockError && lowStock.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <h2 className="mb-2 font-medium">Low stock alert</h2>
            <ul className="space-y-1 text-sm">
              {lowStock.map((product) => (
                <li key={product._id}>
                  <Link
                    to={ROUTES.merchantProductEdit(product._id)}
                    className="hover:underline"
                  >
                    {product.title}
                  </Link>{' '}
                  — {product.stock} left
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold">Top products</h2>
          <DataTable
            columns={[
              { key: 'title', header: 'Product', cell: (row) => row.title },
              { key: 'sold', header: 'Sold', cell: (row) => row.totalSold },
              {
                key: 'revenue',
                header: 'Revenue',
                cell: (row) => formatPrice(row.revenue),
              },
            ]}
            data={dashboard.topProducts}
            emptyTitle="No sales data yet"
            getRowKey={(row) => row._id}
          />
        </div>
      </div>
    </PageContainer>
  )
}
