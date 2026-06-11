import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { StatusBadge } from '@/components/design-system'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  canRetryPayment,
  formatOrderDate,
  formatStatusLabel,
  getOrderStatusSteps,
  getRetryPaymentLabel,
  useCancelOrder,
  useOrderDetail,
} from '@/features/orders'
import { useAuth } from '@/features/auth'
import { preloadRazorpayScript, useRazorpayPayment } from '@/features/payments'
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: order, error, isLoading, refetch } = useOrderDetail(id)
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrder()
  const { pay: payWithRazorpay, isLoading: isPaying } = useRazorpayPayment()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (order && canRetryPayment(order)) {
      void preloadRazorpayScript()
    }
  }, [order])

  const handleRetryPayment = async () => {
    if (!order) return

    try {
      await payWithRazorpay(order._id, user?.email)
      navigate(`${ROUTES.paymentSuccess}?orderId=${order._id}`, { replace: true })
    } catch {
      await refetch()
    }
  }

  const handleCancel = async () => {
    if (!id || cancelReason.trim().length < 3) return
    try {
      await cancelOrder(id, cancelReason.trim())
      await refetch()
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
  const showRetryPayment = canRetryPayment(order)

  return (
    <PageContainer>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.orders}>
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
      </Button>

      {order.orderStatus === 'cancelled' ? (
        <Alert className="mb-6">
          <AlertTitle>Order cancelled</AlertTitle>
          <AlertDescription>
            {order.cancelReason ? `Reason: ${order.cancelReason}. ` : null}
            {order.paymentStatus === 'refunded'
              ? 'Your refund has been initiated and should reflect in your account within 5–7 business days.'
              : order.paymentStatus === 'paid'
                ? 'Refund is being processed. You will be notified once it is complete.'
                : 'This order has been cancelled.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {order.paymentStatus === 'failed' ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>
            {order.paymentFailureReason
              ? `${order.paymentFailureReason}. You can retry payment below.`
              : 'Your payment could not be completed. You can retry payment below.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            status={order.orderStatus}
            label={formatStatusLabel(order.orderStatus)}
          />
          <StatusBadge
            status={order.paymentStatus}
            label={formatStatusLabel(order.paymentStatus)}
          />
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

          {showRetryPayment ? (
            <Button
              className="w-full"
              disabled={isPaying}
              onClick={() => void handleRetryPayment()}
            >
              {isPaying ? (
                <Loader2 className="animate-spin" />
              ) : (
                getRetryPaymentLabel(order)
              )}
            </Button>
          ) : null}

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

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Reason for cancellation</Label>
            <Input
              id="cancelReason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="At least 3 characters..."
            />
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReturnRequestDialog
        open={showReturnDialog}
        onClose={() => setShowReturnDialog(false)}
        orderId={order._id}
        items={order.items}
      />
    </PageContainer>
  )
}
