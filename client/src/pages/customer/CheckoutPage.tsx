import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorState } from '@/components/common/ErrorState'
import { TrustBadges } from '@/components/storefront'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PaymentMethod,
  useApplyCoupon,
  useCheckoutPreview,
  usePlaceOrder,
  type ApplyCouponResponse,
} from '@/features/checkout'
import { useAuth } from '@/features/auth'
import { preloadRazorpayScript, useRazorpayPayment } from '@/features/payments'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'
import { cn } from '@/lib/utils'

function CheckoutPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

const PAYMENT_OPTIONS = [
  { value: PaymentMethod.COD, label: 'Cash on Delivery', hint: 'Pay when your order arrives' },
  { value: PaymentMethod.RAZORPAY, label: 'Razorpay / UPI', hint: 'Cards, UPI, net banking' },
] as const

const CHECKOUT_STEPS = [
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
] as const

function CheckoutSteps({ activeStep }: { activeStep: number }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {CHECKOUT_STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isComplete = stepNumber < activeStep
        const isActive = stepNumber === activeStep

        return (
          <li key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-semibold',
                isComplete || isActive
                  ? 'bg-brand-primary text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {stepNumber}
            </div>
            <span
              className={cn(
                'hidden text-sm font-medium sm:inline',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {index < CHECKOUT_STEPS.length - 1 ? (
              <div
                className={cn(
                  'mx-1 hidden h-px w-8 sm:block md:w-16',
                  isComplete ? 'bg-brand-primary' : 'bg-border',
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<ApplyCouponResponse | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD)

  const { data: preview, error, isLoading, refetch } = useCheckoutPreview(
    selectedAddressId ? { addressId: selectedAddressId } : undefined,
  )
  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCoupon()
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrder()
  const { pay: payWithRazorpay, isLoading: isPaying } = useRazorpayPayment()

  useEffect(() => {
    if (paymentMethod === PaymentMethod.RAZORPAY) {
      void preloadRazorpayScript()
    }
  }, [paymentMethod])

  const cartTotal = preview?.cart?.totalAmount ?? 0
  const discount = appliedCoupon?.discount ?? 0
  const finalTotal = Math.max(cartTotal - discount, 0)

  const handleApplyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return

    try {
      const result = await applyCoupon(code)
      setAppliedCoupon(result)
    } catch {
      setAppliedCoupon(null)
    }
  }

  const handlePlaceOrder = async () => {
    if (!preview?.canCheckout) return

    const addressId =
      selectedAddressId ?? preview.selectedAddress?._id ?? undefined

    try {
      const result = await placeOrder({
        addressId,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      })

      const orderId = result.order._id

      if (result.requiresPayment) {
        try {
          await payWithRazorpay(orderId, user?.email)
          navigate(`${ROUTES.paymentSuccess}?orderId=${orderId}`, { replace: true })
        } catch {
          navigate(`${ROUTES.paymentFailed}?orderId=${orderId}`, { replace: true })
        }
        return
      }

      navigate(ROUTES.orderDetail(orderId), { replace: true })
    } catch {
      // toast handled in hook
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 font-heading text-2xl font-semibold">Checkout</h1>
        <CheckoutPageSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 font-heading text-2xl font-semibold">Checkout</h1>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load checkout preview.')}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (!preview) {
    return null
  }

  const hasAddress =
    Boolean(selectedAddressId ?? preview.selectedAddress?._id) &&
    preview.addresses.length > 0
  const activeStep = hasAddress ? 3 : 1

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-2 font-heading text-2xl font-semibold">Checkout</h1>
      <CheckoutSteps activeStep={activeStep} />
      <TrustBadges className="mb-6" />

      {preview.issues.length > 0 ? (
        <div className="mb-6 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          {preview.issues.map((issue) => (
            <p key={issue} className="text-sm text-amber-800 dark:text-amber-200">
              {issue}
            </p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Select where your order should be delivered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {preview.addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No saved addresses.{' '}
                  <Link to={ROUTES.addresses} className="font-medium text-primary hover:underline">
                    Add an address
                  </Link>{' '}
                  to continue checkout.
                </p>
              ) : (
                preview.addresses.map((address) => (
                  <label
                    key={address._id}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors',
                      (selectedAddressId ?? preview.selectedAddress?._id) === address._id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1"
                      checked={
                        (selectedAddressId ?? preview.selectedAddress?._id) === address._id
                      }
                      onChange={() => setSelectedAddressId(address._id)}
                    />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">
                        {address.fullName}
                        {address.isDefault ? (
                          <span className="ml-2 text-xs text-muted-foreground">(Default)</span>
                        ) : null}
                      </p>
                      <p className="text-muted-foreground">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      </p>
                      <p className="text-muted-foreground">
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      <p className="text-muted-foreground">{address.phone}</p>
                    </div>
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you would like to pay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
                    paymentMethod === option.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.hint}</span>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preview.cart?.items.length ? (
                <ul className="space-y-3">
                  {preview.cart.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2">{item.title}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="shrink-0 font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              )}

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="coupon" className="sr-only">
                    Coupon code
                  </Label>
                  <Input
                    id="coupon"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  onClick={() => void handleApplyCoupon()}
                >
                  {isApplyingCoupon ? <Loader2 className="animate-spin" /> : 'Apply'}
                </Button>
              </div>
              {appliedCoupon ? (
                <p className="text-sm text-emerald-600">
                  Coupon applied. Final amount preview: {formatPrice(appliedCoupon.finalAmount)}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            disabled={!preview.canCheckout || isPlacingOrder || isPaying}
            onClick={() => void handlePlaceOrder()}
          >
            {isPlacingOrder || isPaying ? (
              <>
                <Loader2 className="animate-spin" />
                Placing order...
              </>
            ) : (
              'Place Order'
            )}
          </Button>

          <Button variant="ghost" asChild className="w-full">
            <Link to={ROUTES.cart}>Back to cart</Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}

export { CheckoutPageSkeleton }
