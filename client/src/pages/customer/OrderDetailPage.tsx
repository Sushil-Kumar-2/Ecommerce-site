import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  OrderStatusTimeline,
  ReturnRequestDialog,
  canCancelOrder,
  canRequestReturn,
  formatOrderDate,
  formatStatusLabel,
  getOrderStatusSteps,
  useCancelOrder,
  useOrderDetail,
} from '@/features/orders'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, error, isLoading, refetch } = useOrderDetail(id)
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrder()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const handleCancel = async () => {
    if (!id || cancelReason.trim().length < 3) return
    try {
      await cancelOrder(id, cancelReason.trim())
      setShowCancelDialog(false)
      setCancelReason('')
    } catch {
      // toast in hook
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <OrderDetailSkeleton />
      </PageContainer>
    )
  }

  if (error || !order) {
    return (
      <PageContainer>
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.orders}>
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

  const steps = getOrderStatusSteps(order)

  return (
    <PageContainer>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.orders}>
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{formatStatusLabel(order.orderStatus)}</Badge>
          <Badge>{formatStatusLabel(order.paymentStatus)}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantDetails ?? ''}`}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.variantDetails ? (
                      <p className="text-sm text-muted-foreground">{item.variantDetails}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 ? (
                <p>{order.shippingAddress.addressLine2}</p>
              ) : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline steps={steps} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingCharge)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <p className="pt-2 text-muted-foreground">
                Method: {formatStatusLabel(order.paymentMethod)}
              </p>
            </CardContent>
          </Card>

          {canCancelOrder(order) ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel order
            </Button>
          ) : null}

          {canRequestReturn(order) ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowReturnDialog(true)}
            >
              Request return
            </Button>
          ) : null}
        </aside>
      </div>

      {showCancelDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Cancel order</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancelReason">Reason for cancellation</Label>
                <Input
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="At least 3 characters..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isCancelling}
                >
                  Keep order
                </Button>
                <Button
                  variant="destructive"
                  disabled={isCancelling || cancelReason.trim().length < 3}
                  onClick={() => void handleCancel()}
                >
                  {isCancelling ? <Loader2 className="animate-spin" /> : 'Cancel order'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ReturnRequestDialog
        open={showReturnDialog}
        onClose={() => setShowReturnDialog(false)}
        orderId={order._id}
        items={order.items}
      />
    </PageContainer>
  )
}
