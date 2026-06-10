import { motion, useReducedMotion } from 'framer-motion'
import { Heart, ImageOff, Info, Loader2, ShoppingCart } from 'lucide-react'
import { memo, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { RatingStars } from '@/components/design-system'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { useAddToCart } from '@/features/cart'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist'
import type { Product } from '@/features/products/product.types'
import {
  formatPrice,
  getEffectivePrice,
  getProductImage,
  getProductRoute,
  getStockLabel,
} from '@/features/products/utils'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/routes'

import { ProductBadgeStack } from './ProductBadgeStack'
import { ProductQuickViewDialog } from './ProductQuickViewDialog'

type ViewMode = 'grid' | 'list'

interface ProductListingCardProps {
  product: Product
  categoryName?: string
  viewMode?: ViewMode
}

function ProductListingCardComponent({
  product,
  categoryName,
  viewMode = 'grid',
}: ProductListingCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const { isAuthenticated } = useAuth()
  const { data: wishlist = [] } = useWishlist()
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlist()
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlist()
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCart()
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const image = getProductImage(product.images)
  const effectivePrice = getEffectivePrice(product.price, product.discountPrice)
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
  const stock = getStockLabel(product.stock)
  const isInWishlist = wishlist.some((item) => item.productId === product._id)
  const isWishlistBusy = isAddingToWishlist || isRemovingFromWishlist
  const isList = viewMode === 'list'

  const handleWishlistToggle = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id)
      } else {
        await addToWishlist({ productId: product._id })
      }
    } catch {
      // Toast handled in hooks
    }
  }

  const handleAddToCart = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

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

  const CardWrapper = prefersReducedMotion ? 'article' : motion.article
  const motionProps = prefersReducedMotion
    ? {}
    : {
        whileHover: { y: -4 },
        transition: { duration: 0.2 },
      }

  if (isList) {
    return (
      <>
        <CardWrapper
          {...motionProps}
          className="group/card relative flex h-full flex-row gap-4 overflow-hidden rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-36">
            <Link to={getProductRoute(product._id)} className="block size-full">
              {image ? (
                <img src={image} alt={product.title} className="size-full object-cover" loading="lazy" />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-8 opacity-40" />
                </div>
              )}
            </Link>
            <ProductBadgeStack product={product} layout="overlay" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {categoryName ? (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryName}
              </p>
            ) : null}
            <Link to={getProductRoute(product._id)}>
              <h3 className="line-clamp-1 font-medium text-foreground">{product.title}</h3>
            </Link>
            {product.description ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
            ) : null}
            <div className="mt-auto space-y-2 pt-2">
              {product.totalReviews > 0 ? (
                <RatingStars rating={product.averageRating} totalReviews={product.totalReviews} size="sm" />
              ) : null}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">{formatPrice(effectivePrice)}</span>
                {hasDiscount ? (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" disabled={!stock.inStock || isAddingToCart} onClick={handleAddToCart}>
                  {isAddingToCart ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
                  Add to Cart
                </Button>
                <Button size="sm" variant="outline" onClick={() => setQuickViewOpen(true)} aria-label="Quick view">
                  <Info className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardWrapper>
        <ProductQuickViewDialog product={product} categoryName={categoryName} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
      </>
    )
  }

  return (
    <>
      <CardWrapper
        {...motionProps}
        className="group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-muted">
          <Link
            to={getProductRoute(product._id)}
            className="block size-full"
            aria-label={`View ${product.title}`}
          >
            {image ? (
              <>
                {!imageLoaded ? <Skeleton className="absolute inset-0" /> : null}
                <img
                  src={image}
                  alt={product.title}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  className={cn(
                    'size-full object-cover transition-all duration-500',
                    !prefersReducedMotion && 'group-hover/card:scale-105',
                    imageLoaded ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                <ImageOff className="size-8 opacity-40" />
                <span className="text-xs">No image</span>
              </div>
            )}
          </Link>

          <ProductBadgeStack product={product} layout="overlay" />

          <button
            type="button"
            className={cn(
              'absolute top-2 right-2 z-20 flex size-8 items-center justify-center rounded-full bg-background/95 shadow-sm ring-1 ring-border/60 backdrop-blur-sm transition-all duration-300 hover:bg-background',
              'opacity-100 md:opacity-0 md:group-hover/card:opacity-100',
            )}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            disabled={isWishlistBusy}
            onClick={handleWishlistToggle}
          >
            {isWishlistBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className={cn('size-4', isInWishlist && 'fill-destructive text-destructive')} />
            )}
          </button>

          {!stock.inStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/75">
              <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-destructive shadow-sm">
                Out of stock
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-1 flex-col gap-1.5">
            {categoryName ? (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryName}
              </p>
            ) : null}

            <Link to={getProductRoute(product._id)} className="group/title">
              <h3 className="line-clamp-1 font-medium leading-snug text-foreground transition-colors group-hover/title:text-brand-primary">
                {product.title}
              </h3>
            </Link>

            {product.description ? (
              <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            ) : (
              <div className="min-h-[2.5rem]" aria-hidden />
            )}

            <div className="mt-auto space-y-2 pt-2">
              {product.totalReviews > 0 ? (
                <RatingStars
                  rating={product.averageRating}
                  totalReviews={product.totalReviews}
                  size="sm"
                />
              ) : (
                <p className="text-xs text-muted-foreground">No reviews yet</p>
              )}

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  {formatPrice(effectivePrice)}
                </span>
                {hasDiscount ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className={cn(
              'mt-3 flex gap-2 border-t border-border/50 pt-3 transition-all duration-300',
              'translate-y-0 opacity-100',
              'md:translate-y-2 md:border-transparent md:pt-0 md:opacity-0',
              'md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100',
            )}
          >
            <Button
              type="button"
              size="sm"
              className="h-9 flex-1"
              disabled={!stock.inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShoppingCart className="size-4" />
              )}
              Add to Cart
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 px-3"
              aria-label="Quick view"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setQuickViewOpen(true)
              }}
            >
              <Info className="size-4" />
              <span className="sr-only">Quick View</span>
            </Button>
          </div>
        </div>
      </CardWrapper>

      <ProductQuickViewDialog
        product={product}
        categoryName={categoryName}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  )
}

export const ProductListingCard = memo(
  ProductListingCardComponent,
  (prev, next) =>
    prev.product._id === next.product._id &&
    prev.categoryName === next.categoryName &&
    prev.viewMode === next.viewMode,
)
