import { Heart, Loader2, Minus, Plus, ShoppingCart, Star, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PriceBlock, ProductRow, TrustBadges } from '@/components/storefront'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductDetailSkeleton } from '@/features/products/components/ProductGrid'
import {
  useCategories,
  useProductDetail,
  useRelatedProducts,
} from '@/features/products/hooks'
import type { ProductVariant } from '@/features/products/product.types'
import { getProductImage, getStockLabel } from '@/features/products/utils'
import { useAuth } from '@/features/auth'
import { useAddToCart } from '@/features/cart'
import { useProductReviews } from '@/features/reviews'
import { useAddToWishlist } from '@/features/wishlist'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'
import { cn } from '@/lib/utils'

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            size === 'lg' ? 'size-5' : 'size-4',
            index < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground',
          )}
        />
      ))}
    </div>
  )
}

function ProductReviewsSection({
  productId,
  averageRating,
  totalReviews,
}: {
  productId: string
  averageRating: number
  totalReviews: number
}) {
  const { data: reviews = [], isLoading } = useProductReviews(productId)

  const breakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((review) => review.rating === star).length
      const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
      return { star, count, percent }
    })
  }, [reviews])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading reviews...</p>
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Be the first to review this product after purchase."
      />
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <div className="space-y-4 rounded-xl border p-4">
        <div className="text-center">
          <p className="text-4xl font-semibold">{averageRating.toFixed(1)}</p>
          <RatingStars rating={averageRating} size="lg" />
          <p className="mt-1 text-sm text-muted-foreground">
            {totalReviews} review{totalReviews === 1 ? '' : 's'}
          </p>
        </div>
        <div className="space-y-2">
          {breakdown.map(({ star, count, percent }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-6 text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <RatingStars rating={review.rating} />
              {review.isVerifiedPurchase ? (
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  Verified purchase
                </span>
              ) : null}
            </div>
            {review.comment ? (
              <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
            ) : null}
            {review.images.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt=""
                    className="size-16 rounded-lg object-cover ring-1 ring-foreground/10"
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCart()
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlist()
  const { data: categories = [] } = useCategories()
  const {
    data: product,
    error,
    isLoading,
    refetch,
  } = useProductDetail(id)
  const {
    data: relatedProducts = [],
    isLoading: isRelatedLoading,
  } = useRelatedProducts(id)

  const images = useMemo(() => {
    if (!product) return []
    return product.images.length > 0 ? product.images : []
  }, [product])

  useEffect(() => {
    setSelectedImageIndex(0)
    setSelectedVariant(null)
    setQuantity(1)
  }, [product?._id])

  const hasVariants = product ? product.variants.length > 0 : false
  const activeVariant =
    product && hasVariants
      ? selectedVariant ?? product.variants[0] ?? null
      : null
  const activeStock =
    activeVariant != null ? activeVariant.stock : (product?.stock ?? 0)
  const clampedQuantity = Math.min(quantity, Math.max(1, activeStock))

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load product details.')}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          action={
            <Button asChild>
              <Link to={ROUTES.products}>Browse products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const category = categories.find((entry) => entry._id === product.categoryId)
  const stock = getStockLabel(activeStock)
  const displayImages =
    images.length > 0 ? images : [getProductImage(product.images)].filter(Boolean) as string[]
  const activeImage = displayImages[selectedImageIndex] ?? displayImages[0]

  const handleVariantChange = (value: string) => {
    const variant = product.variants.find(
      (entry) => `${entry.name}:${entry.value}` === value,
    )
    setSelectedVariant(variant ?? null)
    setQuantity(1)
  }

  const requireAuth = () => {
    toast.error('Please sign in to continue.')
    navigate(ROUTES.login, { state: { from: location } })
    return false
  }

  const buildCartPayload = () => {
    if (hasVariants && !activeVariant) {
      toast.error('Please select a variant.')
      return null
    }

    return {
      productId: product._id,
      quantity: clampedQuantity,
      variantName: activeVariant?.name,
      variantValue: activeVariant?.value,
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    const payload = buildCartPayload()
    if (!payload) return

    try {
      await addToCart(payload)
    } catch {
      // Error toast handled in hook
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    const payload = buildCartPayload()
    if (!payload) return

    try {
      await addToCart(payload)
      navigate(ROUTES.checkout)
    } catch {
      // Error toast handled in hook
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    try {
      await addToWishlist({ productId: product._id })
    } catch {
      // Error toast handled in hook
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.home}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`${ROUTES.products}?categoryId=${category._id}`}>
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-none">
              {product.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
            {activeImage ? (
              <div className="aspect-square">
                <img
                  src={activeImage}
                  alt={product.title}
                  className="size-full object-contain p-6 sm:p-10"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-muted/30 text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {displayImages.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {displayImages.map((image, index) => (
                <button
                  key={`${image}-thumb-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={selectedImageIndex === index}
                  className={cn(
                    'size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors sm:size-20',
                    selectedImageIndex === index
                      ? 'border-brand-primary shadow-sm'
                      : 'border-border hover:border-brand-primary/40',
                  )}
                >
                  <img
                    src={image}
                    alt=""
                    className="size-full object-contain p-1.5"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            {product.featured ? (
              <span className="inline-block rounded bg-brand-accent px-2 py-0.5 text-xs font-semibold text-foreground">
                Featured
              </span>
            ) : null}
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <RatingStars rating={product.averageRating} />
              <span className="font-medium">{product.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({product.totalReviews} reviews)
              </span>
            </div>
          </div>

          <PriceBlock
            price={product.price}
            discountPrice={product.discountPrice}
            size="lg"
          />

          <p
            className={cn(
              'inline-flex rounded-full px-3 py-1 text-xs font-medium',
              stock.inStock
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {stock.label}
          </p>

          {hasVariants ? (
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select
                value={
                  activeVariant ? `${activeVariant.name}:${activeVariant.value}` : undefined
                }
                onValueChange={handleVariantChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem
                      key={`${variant.name}-${variant.value}`}
                      value={`${variant.name}:${variant.value}`}
                    >
                      {variant.name}: {variant.value} ({variant.stock} left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex w-fit items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus />
              </Button>
              <span className="min-w-10 text-center text-sm">{clampedQuantity}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={clampedQuantity >= activeStock}
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90"
              disabled={!stock.inStock || isAddingToCart}
              onClick={() => void handleAddToCart()}
            >
              {isAddingToCart ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ShoppingCart />
              )}
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              className="bg-brand-accent text-foreground hover:bg-brand-accent/90"
              disabled={!stock.inStock || isAddingToCart}
              onClick={() => void handleBuyNow()}
            >
              <Zap />
              Buy Now
            </Button>
            <Button
              variant="outline"
              disabled={!stock.inStock || isAddingToWishlist}
              onClick={() => void handleAddToWishlist()}
            >
              {isAddingToWishlist ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Heart />
              )}
              Wishlist
            </Button>
          </div>

          <TrustBadges className="justify-start border-t pt-4" />
        </div>
      </div>

      <section className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.totalReviews})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description || 'No description available for this product.'}
            </p>
          </TabsContent>
          <TabsContent value="specifications" className="mt-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium">{product.slug || product._id.slice(-8)}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="font-medium">{activeStock} units</dd>
              </div>
              {category ? (
                <div className="rounded-lg border p-3">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{category.name}</dd>
                </div>
              ) : null}
              {hasVariants ? (
                <div className="rounded-lg border p-3 sm:col-span-2">
                  <dt className="text-muted-foreground">Variants</dt>
                  <dd className="mt-1 font-medium">
                    {product.variants
                      .map((variant) => `${variant.name}: ${variant.value}`)
                      .join(', ')}
                  </dd>
                </div>
              ) : null}
            </dl>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <ProductReviewsSection
              productId={product._id}
              averageRating={product.averageRating}
              totalReviews={product.totalReviews}
            />
          </TabsContent>
        </Tabs>
      </section>

      {relatedProducts.length > 0 || isRelatedLoading ? (
        <section className="mt-12">
          <ProductRow
            title="Related products"
            products={relatedProducts}
            viewAllHref={ROUTES.products}
          />
        </section>
      ) : null}
    </div>
  )
}
