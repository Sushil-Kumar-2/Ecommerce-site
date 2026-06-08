import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/features/auth'
import { useCart, useCartItemCount } from '@/features/cart'
import { formatPrice } from '@/features/products/utils'
import { ROUTES } from '@/utils/routes'

export function MiniCartSheet() {
  const { isAuthenticated } = useAuth()
  const cartCount = useCartItemCount()
  const { data: cart } = useCart()

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" asChild aria-label="Shopping cart">
        <Link to={ROUTES.login}>
          <ShoppingCart />
        </Link>
      </Button>
    )
  }

  const items = cart?.items ?? []
  const totalAmount = cart?.totalAmount ?? 0

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
          <ShoppingCart />
          {cartCount > 0 ? (
            <Badge className="absolute -top-1 -right-1 size-5 min-w-5 bg-brand-primary px-1 text-[10px]">
              {cartCount > 99 ? '99+' : cartCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart ({cartCount})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 border-b pb-3 last:border-0">
                <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <SheetFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90">
              <Link to={ROUTES.checkout}>Proceed to checkout</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to={ROUTES.cart}>View full cart</Link>
            </Button>
          </SheetFooter>
        ) : (
          <SheetFooter>
            <Button asChild className="w-full">
              <Link to={ROUTES.products}>Continue shopping</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
