import { Info, Loader2, ShoppingCart } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { RatingStars, StatusBadge } from '@/components/design-system'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/features/auth'
import { useAddToCart } from '@/features/cart'
import type { Product } from '@/features/products/product.types'
import {
  formatPrice,
  getEffectivePrice,
  getProductImage,
  getProductRoute,
  getStockLabel,
} from '@/features/products/utils'
import { ROUTES } from '@/utils/routes'

interface ProductQuickViewDialogProps {
  product: Product | null
  categoryName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductQuickViewDialog({
  product,
  categoryName,
  open,
  onOpenChange,
}: ProductQuickViewDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCart()

  if (!product) return null

  const image = getProductImage(product.images)
  const effectivePrice = getEffectivePrice(product.price, product.discountPrice)
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
  const stock = getStockLabel(product.stock)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }

    try {
      await addToCart({ productId: product._id, quantity: 1 })
    } catch {
      // Toast handled in hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <img src={image} alt={product.title} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="space-y-4 p-6">
          <DialogHeader className="space-y-2 text-left">
            {categoryName ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {categoryName}
              </p>
            ) : null}
            <DialogTitle className="text-xl leading-snug">{product.title}</DialogTitle>
            <DialogDescription className="line-clamp-3 text-sm">
              {product.description}
            </DialogDescription>
          </DialogHeader>

          {product.totalReviews > 0 ? (
            <RatingStars
              rating={product.averageRating}
              totalReviews={product.totalReviews}
              size="sm"
            />
          ) : null}

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold">{formatPrice(effectivePrice)}</span>
            {hasDiscount ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          <StatusBadge
            status={stock.inStock ? 'in_stock' : 'out_of_stock'}
            label={stock.label}
          />

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="w-full sm:flex-1"
              disabled={!stock.inStock || isAddingToCart}
              onClick={() => void handleAddToCart()}
            >
              {isAddingToCart ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShoppingCart className="size-4" />
              )}
              Add to Cart
            </Button>
            <Button type="button" variant="outline" className="w-full sm:flex-1" asChild>
              <Link to={getProductRoute(product._id)} onClick={() => onOpenChange(false)}>
                <Info className="size-4" />
                View Full Details
              </Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
