import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  MerchantFulfillmentStatus,
  RejectOrderDialog,
  ShipOrderDialog,
  useAcceptMerchantOrder,
  useMerchantOrderDetail,
  useReadyToShipMerchantOrder,
} from '@/features/merchant-orders'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function MerchantOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, error, isLoading, refetch } = useMerchantOrderDetail(id)
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptMerchantOrder()
  const [readyToShip, { isLoading: isMarkingReady }] = useReadyToShipMerchantOrder()
  const [showShipDialog, setShowShipDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  if (error || (!isLoading && !order)) {
    return (
      <PageContainer title="Order detail">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.merchantOrders}>
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>
        </Button>
        <ErrorState
          message={getApiErrorMessage(error, 'Order not found.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  if (!order) {
    return (
      <PageContainer title="Order detail">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </PageContainer>
    )
  }

  const fulfillment = order.merchantFulfillment.status

  return (
    <PageContainer title={order.orderNumber}>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.merchantOrders}>
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
      </Button>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline">{fulfillment.replace(/_/g, ' ')}</Badge>
        <Badge>{order.paymentStatus}</Badge>
        <Badge variant="secondary">{order.paymentMethod}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <DataTable
            columns={[
              { key: 'title', header: 'Item', cell: (row) => row.title },
              { key: 'qty', header: 'Qty', cell: (row) => row.quantity },
              {
                key: 'price',
                header: 'Total',
                cell: (row) => formatPrice(row.price * row.quantity),
              },
            ]}
            data={order.items}
            getRowKey={(row) => row.productId}
          />

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatPrice(order.merchantSubtotal)}
              </p>
              {order.merchantFulfillment.trackingNumber ? (
                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <p>Tracking: {order.merchantFulfillment.trackingNumber}</p>
                  {order.merchantFulfillment.carrier ? (
                    <p>Carrier: {order.merchantFulfillment.carrier}</p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {fulfillment === MerchantFulfillmentStatus.PENDING ? (
            <div className="flex flex-col gap-2">
              <Button
                disabled={isAccepting}
                onClick={() => id && void acceptOrder(id)}
              >
                Accept order
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
              >
                Reject order
              </Button>
            </div>
          ) : null}

          {fulfillment === MerchantFulfillmentStatus.ACCEPTED ? (
            <Button
              disabled={isMarkingReady}
              onClick={() => id && void readyToShip(id)}
            >
              Mark ready to ship
            </Button>
          ) : null}

          {fulfillment === MerchantFulfillmentStatus.READY_TO_SHIP ? (
            <Button onClick={() => setShowShipDialog(true)}>Ship order</Button>
          ) : null}
        </aside>
      </div>

      {id ? (
        <>
          <ShipOrderDialog
            open={showShipDialog}
            onClose={() => setShowShipDialog(false)}
            orderId={id}
          />
          <RejectOrderDialog
            open={showRejectDialog}
            onClose={() => setShowRejectDialog(false)}
            orderId={id}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
