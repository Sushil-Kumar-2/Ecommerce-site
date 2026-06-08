import { Link } from 'react-router-dom'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Skeleton } from '@/components/ui/skeleton'
import {
  OrdersChart,
  RevenueChart,
  StatCard,
  useAdminDashboard,
  useAdminMonthlyRevenue,
} from '@/features/dashboard'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function AdminHomePage() {
  const {
    data: dashboard,
    error: dashboardError,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useAdminDashboard()
  const {
    data: monthlyRevenue = [],
    error: revenueError,
    isLoading: isRevenueLoading,
    refetch: refetchRevenue,
  } = useAdminMonthlyRevenue()

  const isLoading = isDashboardLoading || isRevenueLoading
  const error = dashboardError ?? revenueError

  if (isLoading) {
    return (
      <PageContainer
        title="Admin Dashboard"
        description="Platform overview and management tools."
      >
        <DashboardSkeleton />
      </PageContainer>
    )
  }

  if (error || !dashboard) {
    return (
      <PageContainer
        title="Admin Dashboard"
        description="Platform overview and management tools."
      >
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load dashboard.')}
          onRetry={() => {
            void refetchDashboard()
            void refetchRevenue()
          }}
        />
      </PageContainer>
    )
  }

  const { overview, topProducts, topMerchants, topCategories } = dashboard
  const chartData =
    monthlyRevenue.length > 0 ? monthlyRevenue : dashboard.monthlyRevenue

  return (
    <PageContainer
      title="Admin Dashboard"
      description="Platform overview and management tools."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={overview.totalUsers} />
        <StatCard title="Total Merchants" value={overview.totalMerchants} />
        <StatCard title="Total Products" value={overview.totalProducts} />
        <StatCard title="Total Orders" value={overview.totalOrders} />
        <StatCard title="Total Revenue" value={formatPrice(overview.totalRevenue)} />
        <StatCard title="Pending Orders" value={overview.pendingOrders} />
        <StatCard title="Refunded Orders" value={overview.refundedOrders} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <RevenueChart data={chartData} />
        <OrdersChart data={chartData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold">Top products</h2>
          <DataTable
          columns={[
            { key: 'title', header: 'Product', cell: (row) => row.title },
            {
              key: 'sold',
              header: 'Sold',
              cell: (row) => row.totalSold,
            },
            {
              key: 'revenue',
              header: 'Revenue',
              cell: (row) => formatPrice(row.revenue),
            },
          ]}
          data={topProducts}
          getRowKey={(row) => row.productId}
          emptyTitle="No top products"
        />
        </div>
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold">Top merchants</h2>
          <DataTable
          columns={[
            {
              key: 'name',
              header: 'Merchant',
              cell: (row) => (
                <Link
                  to={ROUTES.adminMerchantDetail(row.merchantId)}
                  className="hover:underline"
                >
                  {row.merchantName}
                </Link>
              ),
            },
            {
              key: 'orders',
              header: 'Orders',
              cell: (row) => row.totalOrders,
            },
            {
              key: 'revenue',
              header: 'Revenue',
              cell: (row) => formatPrice(row.revenue),
            },
          ]}
          data={topMerchants}
          getRowKey={(row) => row.merchantId}
          emptyTitle="No top merchants"
        />
        </div>
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold">Top categories</h2>
          <DataTable
          columns={[
            {
              key: 'name',
              header: 'Category',
              cell: (row) => row.categoryName,
            },
            {
              key: 'sold',
              header: 'Sold',
              cell: (row) => row.totalSold,
            },
            {
              key: 'revenue',
              header: 'Revenue',
              cell: (row) => formatPrice(row.revenue),
            },
          ]}
          data={topCategories}
          getRowKey={(row) => row.categoryId}
          emptyTitle="No top categories"
        />
        </div>
      </div>
    </PageContainer>
  )
}
