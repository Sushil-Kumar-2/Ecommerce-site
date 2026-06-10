import { Loader2, Package, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState, type MouseEvent } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/design-system'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAddToCart } from '@/features/cart'
import {
  formatOrderDate,
  formatStatusLabel,
  useMyOrders,
  type Order,
} from '@/features/orders'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function OrdersPageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

function paymentStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'default'
    case 'failed':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

function OrderCard({ order }: { order: Order }) {
  const [addToCart, { isLoading: isBuyingAgain }] = useAddToCart()
  const firstItem = order.items[0]
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  const handleBuyAgain = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    for (const item of order.items) {
      try {
        await addToCart({
          productId: item.productId,
          quantity: item.quantity,
        })
      } catch {
        return
      }
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to={ROUTES.orderDetail(order._id)}
          className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
        >
          {firstItem?.image ? (
            <img
              src={firstItem.image}
              alt={firstItem.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Package className="size-8 text-muted-foreground" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                to={ROUTES.orderDetail(order._id)}
                className="font-medium hover:text-brand-primary hover:underline"
              >
                {order.orderNumber}
              </Link>
              <p className="text-sm text-muted-foreground">
                Placed on {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
          </div>

          <p className="line-clamp-1 text-sm">
            {firstItem?.title}
            {order.items.length > 1
              ? ` + ${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}`
              : null}
          </p>
          <p className="text-xs text-muted-foreground">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={order.orderStatus}
              label={formatStatusLabel(order.orderStatus)}
            />
            <Badge variant={paymentStatusVariant(order.paymentStatus)}>
              {formatStatusLabel(order.paymentStatus)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm" variant="outline">
              <Link to={ROUTES.orderDetail(order._id)}>View details</Link>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isBuyingAgain}
              onClick={(event) => void handleBuyAgain(event)}
            >
              {isBuyingAgain ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RotateCcw />
              )}
              Buy again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrdersPage() {
  const { data: orders = [], error, isLoading, refetch } = useMyOrders()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      ),
    [orders],
  )

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return sortedOrders
    return sortedOrders.filter((order) => order.orderStatus === statusFilter)
  }, [sortedOrders, statusFilter])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Your Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage your purchases.</p>
        </div>
        <OrdersPageSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold">Your Orders</h1>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load orders.')}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Your Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage your purchases.</p>
        </div>
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={
            <Button asChild>
              <Link to={ROUTES.products}>Browse products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Your Orders</h1>
        <p className="text-sm text-muted-foreground">Track and manage your purchases.</p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {STATUS_FILTERS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-full border data-[state=active]:border-brand-primary data-[state=active]:bg-brand-primary data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders in this category"
          description="Try a different filter to see your orders."
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
