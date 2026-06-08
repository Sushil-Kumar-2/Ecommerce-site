import { Link } from 'react-router-dom'
import { useState } from 'react'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MerchantFulfillmentStatus,
  useMerchantOrderSummary,
  useMerchantOrders,
  type MerchantOrderView,
} from '@/features/merchant-orders'
import { formatOrderDate } from '@/features/orders'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: MerchantFulfillmentStatus.PENDING },
  { label: 'Accepted', value: MerchantFulfillmentStatus.ACCEPTED },
  { label: 'Ready to ship', value: MerchantFulfillmentStatus.READY_TO_SHIP },
  { label: 'Shipped', value: MerchantFulfillmentStatus.SHIPPED },
  { label: 'Rejected', value: MerchantFulfillmentStatus.REJECTED },
] as const

export function MerchantOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<
    MerchantFulfillmentStatus | ''
  >('')
  const [page, setPage] = useState('1')

  const { data: summary } = useMerchantOrderSummary()
  const { data, error, isLoading, refetch } = useMerchantOrders({
    status: statusFilter === '' ? undefined : statusFilter,
    page,
    limit: '20',
  })

  if (error) {
    return (
      <PageContainer title="Orders">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load orders.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  const orders = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <PageContainer title="Orders" description="Manage incoming customer orders.">
      {summary ? (
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge variant="outline">Total: {summary.total}</Badge>
          <Badge variant="secondary">Pending: {summary.pending}</Badge>
          <Badge variant="secondary">Accepted: {summary.accepted}</Badge>
          <Badge variant="secondary">Ready: {summary.readyToShip}</Badge>
          <Badge variant="secondary">Shipped: {summary.shipped}</Badge>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(filter.value)
              setPage('1')
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <DataTable<MerchantOrderView>
        columns={[
          {
            key: 'orderNumber',
            header: 'Order',
            cell: (row) => (
              <Link
                to={ROUTES.merchantOrderDetail(row.orderId)}
                className="font-medium hover:underline"
              >
                {row.orderNumber}
              </Link>
            ),
          },
          {
            key: 'date',
            header: 'Date',
            cell: (row) => formatOrderDate(row.createdAt),
          },
          {
            key: 'status',
            header: 'Fulfillment',
            cell: (row) => (
              <Badge variant="outline">
                {row.merchantFulfillment.status.replace(/_/g, ' ')}
              </Badge>
            ),
          },
          {
            key: 'payment',
            header: 'Payment',
            cell: (row) => row.paymentStatus,
          },
          {
            key: 'total',
            header: 'Subtotal',
            cell: (row) => formatPrice(row.merchantSubtotal),
          },
        ]}
        data={orders}
        isLoading={isLoading}
        emptyTitle="No orders found"
        getRowKey={(row) => row.orderId}
      />

      {totalPages > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === '1'}
            onClick={() => setPage(String(Number(page) - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={Number(page) >= totalPages}
            onClick={() => setPage(String(Number(page) + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </PageContainer>
  )
}
