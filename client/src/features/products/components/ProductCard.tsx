import { motion, useReducedMotion } from 'framer-motion'
import { Heart, ImageOff, Info, Loader2, ShoppingCart } from 'lucide-react'
import { memo, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { RatingStars } from '@/components/design-system'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { useAddToCart } from '@/features/cart'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/routes'

import { ProductBadgeStack } from './listing/ProductBadgeStack'
import { ProductQuickViewDialog } from './listing/ProductQuickViewDialog'
import type { Product } from '../product.types'
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  getProductImage,
  getProductRoute,
  getStockLabel,
} from '../utils'

type CardLayout = 'grid' | 'list'
type CardDensity = 'default' | 'compact'

interface ProductCardProps {
  product: Product
  categoryName?: string
  className?: string
  layout?: CardLayout
  density?: CardDensity
  showQuickView?: boolean
  footerActions?: ReactNode
}

function ProductCardComponent({
  product,
  categoryName,
  className,
  layout = 'grid',
  density = 'default',
  showQuickView = false,
  footerActions,
}: ProductCardProps) {
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
  const discountPercent = getDiscountPercent(product.price, product.discountPrice)
  const effectivePrice = getEffectivePrice(product.price, product.discountPrice)
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
  const stock = getStockLabel(product.stock)
  const isInWishlist = wishlist.some((item) => item.productId === product._id)
  const isWishlistBusy = isAddingToWishlist || isRemovingFromWishlist
  const isList = layout === 'list'
  const isCompact = density === 'compact'
  const showDefaultActions = !footerActions && !isCompact

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

  const imageBlock = (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        isList
          ? 'aspect-square w-32 shrink-0 rounded-lg sm:w-40'
          : cn('w-full flex-[7]', isCompact ? 'min-h-[180px]' : 'min-h-[240px]'),
      )}
    >
      <Link
        to={getProductRoute(product._id)}
        className="block size-full"
        aria-label={`View ${product.title}`}
      >
        {image ? (
          <>
            {!imageLoaded ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
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
            <ImageOff className="size-9 opacity-40" />
            <span className="text-xs">No image</span>
          </div>
        )}
      </Link>

      <div className="pointer-events-none absolute top-3 left-3 z-10 max-w-[calc(100%-3.5rem)]">
        <ProductBadgeStack product={product} />
      </div>

      <button
        type="button"
        className={cn(
          'absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border/60 backdrop-blur-sm transition-all hover:bg-background',
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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[1px]">
          <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-destructive shadow-sm">
            Out of stock
          </span>
        </div>
      ) : null}
    </div>
  )

  const infoBlock = (
    <div
      className={cn(
        'flex flex-col gap-2',
        isList ? 'min-w-0 flex-1 py-1' : cn('flex-[3]', isCompact ? 'gap-1.5 p-3' : 'gap-2 p-4 pt-3'),
      )}
    >
      {categoryName ? (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {categoryName}
        </p>
      ) : null}

      <Link to={getProductRoute(product._id)} className="group/title">
        <h3 className="line-clamp-2 font-medium leading-snug text-foreground transition-colors group-hover/title:text-brand-primary">
          {product.title}
        </h3>
      </Link>

      {!isCompact && product.description ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      ) : null}

      {product.totalReviews > 0 ? (
        <div className="flex items-center gap-1.5 text-xs">
          <RatingStars
            rating={product.averageRating}
            size="sm"
            showValue
          />
          <span className="text-muted-foreground">
            ({product.totalReviews.toLocaleString()}{' '}
            {product.totalReviews === 1 ? 'Review' : 'Reviews'})
          </span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No reviews yet</p>
      )}

      <div className="space-y-1.5 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xl font-bold tracking-tight text-foreground">
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          ) : null}
        </div>
        {hasDiscount ? (
          <Badge
            variant="outline"
            className="rounded-md border-brand-deal/30 bg-brand-deal/10 px-2 py-0 text-[11px] font-bold text-brand-deal"
          >
            {discountPercent}% OFF
          </Badge>
        ) : null}
      </div>

      {showDefaultActions ? (
        <div
          className={cn(
            'mt-auto flex gap-2 pt-2 transition-opacity duration-200',
            'opacity-100 md:opacity-0 md:group-hover/card:opacity-100',
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
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Cart</span>
          </Button>

          {showQuickView ? (
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
              <span className="sr-only sm:not-sr-only sm:ml-1.5">Quick View</span>
            </Button>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 px-3"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            disabled={isWishlistBusy}
            onClick={handleWishlistToggle}
          >
            {isWishlistBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className={cn('size-4', isInWishlist && 'fill-destructive text-destructive')} />
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-auto border-t pt-3">{footerActions}</div>
      )}
    </div>
  )

  return (
    <>
      <CardWrapper
        {...motionProps}
        className={cn(
          'group/card relative flex h-full overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg',
          isList ? 'flex-row gap-4 p-3' : cn('flex-col', isCompact ? 'min-h-[300px]' : 'min-h-[420px]'),
          className,
        )}
      >
        {imageBlock}
        {infoBlock}
      </CardWrapper>

      {showQuickView ? (
        <ProductQuickViewDialog
          product={product}
          categoryName={categoryName}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      ) : null}
    </>
  )
}

export const ProductCard = memo(
  ProductCardComponent,
  (prev, next) =>
    prev.product._id === next.product._id &&
    prev.categoryName === next.categoryName &&
    prev.layout === next.layout &&
    prev.density === next.density &&
    prev.showQuickView === next.showQuickView &&
    prev.footerActions === next.footerActions,
)
