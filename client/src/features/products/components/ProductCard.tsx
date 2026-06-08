import { Heart, ImageOff, Loader2, Star } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { MouseEvent, ReactNode } from 'react'

import { useAuth } from '@/features/auth'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/routes'

import type { Product } from '../product.types'
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  getProductImage,
  getProductRoute,
  getStockLabel,
} from '../utils'

interface ProductCardProps {
  product: Product
  className?: string
  footerActions?: ReactNode
}

function RatingRow({
  rating,
  totalReviews,
}: {
  rating: number
  totalReviews: number
}) {
  if (totalReviews <= 0) return null

  return (
    <div className="flex items-center gap-1 text-xs">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3',
              index < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted',
            )}
          />
        ))}
      </div>
      <span className="text-brand-primary">{totalReviews.toLocaleString()}</span>
    </div>
  )
}

export function ProductCard({ product, className, footerActions }: ProductCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { data: wishlist = [] } = useWishlist()
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlist()
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlist()

  const image = getProductImage(product.images)
  const discountPercent = getDiscountPercent(product.price, product.discountPrice)
  const effectivePrice = getEffectivePrice(product.price, product.discountPrice)
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
  const stock = getStockLabel(product.stock)
  const isInWishlist = wishlist.some((item) => item.productId === product._id)
  const isWishlistBusy = isAddingToWishlist || isRemovingFromWishlist

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

  return (
    <article
      className={cn(
        'group/card relative flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-border/60 transition-shadow hover:shadow-md',
        className,
      )}
    >
      <Link to={getProductRoute(product._id)} className="flex flex-1 flex-col">
        <div className="relative flex h-40 items-center justify-center bg-white px-3 pt-3 sm:h-44">
          {image ? (
            <img
              src={image}
              alt={product.title}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageOff className="size-8 opacity-40" />
              <span className="text-[10px]">No image</span>
            </div>
          )}

          {!stock.inStock ? (
            <div className="absolute inset-0 flex items-end justify-center bg-white/70 pb-3">
              <span className="text-xs font-medium text-destructive">Currently unavailable</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
          <h3 className="line-clamp-2 text-sm leading-snug text-foreground group-hover/card:text-brand-primary">
            {product.title}
          </h3>

          <RatingRow rating={product.averageRating} totalReviews={product.totalReviews} />

          {product.featured ? (
            <span className="text-[11px] font-semibold text-amber-700">Featured</span>
          ) : null}

          {discountPercent > 0 ? (
            <span className="text-[11px] font-semibold text-brand-deal">
              {discountPercent}% off
            </span>
          ) : null}

          <div className="mt-auto space-y-0.5 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
              <span className="text-lg font-medium text-foreground">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount ? (
                <span className="text-xs text-muted-foreground line-through">
                  M.R.P.: {formatPrice(product.price)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm ring-1 ring-border/50 transition-opacity group-hover/card:opacity-100 hover:bg-white"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        disabled={isWishlistBusy}
        onClick={handleWishlistToggle}
      >
        {isWishlistBusy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Heart
            className={cn('size-3.5', isInWishlist && 'fill-red-500 text-red-500')}
          />
        )}
      </button>

      {footerActions ? <div className="border-t px-3 py-2">{footerActions}</div> : null}
    </article>
  )
}
