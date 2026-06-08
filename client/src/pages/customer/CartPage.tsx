import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ProductRow } from '@/components/storefront'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart'
import { useBestSellers } from '@/features/products/hooks'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function CartPageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4 rounded-xl border p-4">
          <Skeleton className="size-20 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CartPage() {
  const { data: cart, error, isLoading, refetch } = useCart()
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItem()
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItem()
  const { data: recommended = [] } = useBestSellers()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 font-heading text-2xl font-semibold">Shopping Cart</h1>
        <CartPageSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 font-heading text-2xl font-semibold">Shopping Cart</h1>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load your cart.')}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-6">
        <h1 className="font-heading text-2xl font-semibold">Shopping Cart</h1>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse products and add items to your cart."
          action={
            <Button asChild>
              <Link to={ROUTES.products}>Browse products</Link>
            </Button>
          }
        />
        {recommended.length > 0 ? (
          <ProductRow title="Popular picks" products={recommended.slice(0, 8)} />
        ) : null}
      </div>
    )
  }

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return
    await updateCartItem(productId, quantity)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Shopping Cart ({cart.items.length} item{cart.items.length === 1 ? '' : 's'})
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {cart.items.map((item) => {
            const lineTotal = item.price * item.quantity
            const canAdjust = item.status === 'IN_STOCK'
            const variantLabel =
              item.variantName && item.variantValue
                ? `${item.variantName}: ${item.variantValue}`
                : null

            return (
              <div
                key={item.productId}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                <Link
                  to={ROUTES.productDetail(item.productId)}
                  className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    to={ROUTES.productDetail(item.productId)}
                    className="font-medium hover:text-brand-primary hover:underline"
                  >
                    {item.title}
                  </Link>
                  {variantLabel ? (
                    <p className="text-xs text-muted-foreground">{variantLabel}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price)} each
                  </p>
                  {item.status !== 'IN_STOCK' ? (
                    <p className="text-sm text-destructive">
                      {item.status.replace(/_/g, ' ')}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 sm:ml-auto">
                  <div className="flex items-center rounded-lg border">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!canAdjust || isUpdating || item.quantity <= 1}
                      onClick={() =>
                        void handleQuantityChange(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus />
                    </Button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={
                        !canAdjust ||
                        isUpdating ||
                        item.quantity >= item.availableStock
                      }
                      onClick={() =>
                        void handleQuantityChange(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus />
                    </Button>
                  </div>

                  <p className="min-w-24 text-right font-semibold">{formatPrice(lineTotal)}</p>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isRemoving}
                    onClick={() => void removeCartItem(item.productId)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <aside className="sticky top-24 h-fit space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Delivery</span>
              <span>FREE</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-medium">Total</span>
            <span className="text-xl font-semibold">{formatPrice(cart.totalAmount)}</span>
          </div>

          <Button
            asChild
            className="w-full bg-brand-primary hover:bg-brand-primary/90"
            disabled={!cart.canCheckout}
          >
            <Link to={ROUTES.checkout}>Proceed to Checkout</Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link to={ROUTES.products}>Continue shopping</Link>
          </Button>

          {!cart.canCheckout ? (
            <p className="text-sm text-destructive">
              Some items in your cart are unavailable. Update quantities or remove items to
              continue.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export { CartPageSkeleton }
