import { Heart, Loader2, Minus, Plus, ShoppingCart, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageShell, RatingStars, StatusBadge } from '@/components/design-system'
import { PriceBlock, StickyMobileCTA, TrustBadges } from '@/components/storefront'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/features/products/components/ProductCard'
import { ProductCardSkeleton } from '@/features/products/components/ProductCardSkeleton'
import {
  useCategories,
  useProductDetail,
  useRelatedProducts,
} from '@/features/products/hooks'
import type { ProductVariant } from '@/features/products/product.types'
import { buildCategoryMap, getProductImage, getStockLabel } from '@/features/products/utils'
import { useAuth } from '@/features/auth'
import { useAddToCart } from '@/features/cart'
import { ProductReviewsSection } from '@/features/reviews'
import { useAddToWishlist } from '@/features/wishlist'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'
import { cn } from '@/lib/utils'

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

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories])

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
      <PageShell className="pb-24 md:pb-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load product details.')}
          onRetry={() => void refetch()}
        />
      </PageShell>
    )
  }

  if (!product) {
    return (
      <PageShell>
        <EmptyState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          action={
            <Button asChild>
              <Link to={ROUTES.products}>Browse products</Link>
            </Button>
          }
        />
      </PageShell>
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
    <PageShell className="pb-24 md:pb-10">
      <Breadcrumb className="mb-6 text-xs text-muted-foreground">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.home} className="transition-colors hover:text-foreground">
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`${ROUTES.products}?categoryId=${category._id}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate font-normal text-muted-foreground sm:max-w-md">
              {product.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            {activeImage ? (
              <div className="aspect-square bg-muted/20">
                <img
                  src={activeImage}
                  alt={product.title}
                  className="size-full object-cover transition-opacity duration-300"
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
                    'size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-card transition-all sm:size-20',
                    selectedImageIndex === index
                      ? 'border-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                      : 'border-border/60 hover:border-brand-primary/40',
                  )}
                >
                  <img src={image} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3 border-b border-border/60 pb-6">
            {category ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category.name}
              </p>
            ) : null}

            <div className="flex flex-wrap items-start gap-2">
              {product.featured ? (
                <span className="rounded-md bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                  Featured
                </span>
              ) : null}
              <StatusBadge
                status={stock.inStock ? 'in_stock' : 'out_of_stock'}
                label={stock.label}
                variant={stock.inStock ? 'success' : 'destructive'}
              />
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {product.title}
            </h1>

            {product.totalReviews > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <RatingStars rating={product.averageRating} size="md" showValue />
                <span className="text-sm text-muted-foreground">
                  ({product.totalReviews.toLocaleString()}{' '}
                  {product.totalReviews === 1 ? 'Review' : 'Reviews'})
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            )}

            <PriceBlock
              price={product.price}
              discountPrice={product.discountPrice}
              size="lg"
              className="pt-1"
            />
          </div>

          {hasVariants ? (
            <div className="space-y-2">
              <Label htmlFor="variant-select" className="text-sm font-medium">
                Variant
              </Label>
              <Select
                value={
                  activeVariant ? `${activeVariant.name}:${activeVariant.value}` : undefined
                }
                onValueChange={handleVariantChange}
              >
                <SelectTrigger id="variant-select" className="w-full max-w-sm">
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

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-3">
              <Label htmlFor="quantity" className="sr-only">
                Quantity
              </Label>
              <div
                id="quantity"
                className="flex h-11 items-center rounded-lg border border-border/80 bg-background shadow-sm"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-r-none"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </Button>
                <span className="min-w-12 text-center text-sm font-semibold tabular-nums">
                  {clampedQuantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-l-none"
                  disabled={clampedQuantity >= activeStock}
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-w-[140px] flex-1 border-2 transition-colors sm:flex-none"
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
                type="button"
                size="lg"
                className="min-w-[140px] flex-1 bg-foreground text-background shadow-md transition-all hover:bg-foreground/90 hover:shadow-lg sm:flex-none"
                disabled={!stock.inStock || isAddingToCart}
                onClick={() => void handleBuyNow()}
              >
                <Zap />
                Buy Now
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="shrink-0"
                disabled={!stock.inStock || isAddingToWishlist}
                onClick={() => void handleAddToWishlist()}
                aria-label="Add to wishlist"
              >
                {isAddingToWishlist ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Heart />
                )}
              </Button>
            </div>
          </div>

          <TrustBadges variant="grid" />
        </div>
      </div>

      <section className="mt-14 border-t border-border/60 pt-10">
        <Tabs defaultValue="description" className="w-full">
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0"
          >
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Reviews ({product.totalReviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 max-w-3xl">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.description || 'No description available for this product.'}
            </p>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <dl className="grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  SKU
                </dt>
                <dd className="mt-1 font-medium">{product.slug || product._id.slice(-8)}</dd>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stock
                </dt>
                <dd className="mt-1 font-medium">{activeStock} units</dd>
              </div>
              {category ? (
                <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </dt>
                  <dd className="mt-1 font-medium">{category.name}</dd>
                </div>
              ) : null}
              {hasVariants ? (
                <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Variants
                  </dt>
                  <dd className="mt-1 font-medium">
                    {product.variants
                      .map((variant) => `${variant.name}: ${variant.value}`)
                      .join(', ')}
                  </dd>
                </div>
              ) : null}
            </dl>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProductReviewsSection
              productId={product._id}
              averageRating={product.averageRating}
              totalReviews={product.totalReviews}
            />
          </TabsContent>
        </Tabs>
      </section>

      {relatedProducts.length > 0 || isRelatedLoading ? (
        <section className="mt-14 border-t border-border/60 pt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              Related products
            </h2>
            <Link
              to={ROUTES.products}
              className="text-sm font-medium text-brand-primary transition-colors hover:underline"
            >
              View all
            </Link>
          </div>

          {isRelatedLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related._id}
                  product={related}
                  categoryName={categoryMap[related.categoryId]}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <StickyMobileCTA>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-2"
            disabled={!stock.inStock || isAddingToCart}
            onClick={() => void handleAddToCart()}
          >
            {isAddingToCart ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
            Add to Cart
          </Button>
          <Button
            type="button"
            className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            disabled={!stock.inStock || isAddingToCart}
            onClick={() => void handleBuyNow()}
          >
            <Zap />
            Buy Now
          </Button>
        </div>
      </StickyMobileCTA>
    </PageShell>
  )
}
