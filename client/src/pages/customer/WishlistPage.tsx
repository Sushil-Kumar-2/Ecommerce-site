import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/features/products/components/ProductCard'
import {
  useMoveWishlistToCart,
  useRemoveFromWishlist,
  useWishlist,
} from '@/features/wishlist'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'
import type { Product } from '@/features/products/product.types'

function mapWishlistItemToProduct(item: {
  productId: string
  title: string
  slug: string
  price: number
  discountPrice: number
  stock: number
  averageRating: number
  totalReviews: number
  image: string | null
}): Product {
  return {
    _id: item.productId,
    title: item.title,
    slug: item.slug,
    description: '',
    categoryId: '',
    merchantId: '',
    images: item.image ? [item.image] : [],
    price: item.price,
    discountPrice: item.discountPrice,
    stock: item.stock,
    variants: [],
    averageRating: item.averageRating,
    totalReviews: item.totalReviews,
    featured: false,
    status: 'approved',
  }
}

function WishlistPageSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-80 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function WishlistPage() {
  const { data: items = [], error, isLoading, refetch } = useWishlist()
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlist()
  const [moveToCart, { isLoading: isMoving }] = useMoveWishlistToCart()

  if (isLoading) {
    return (
      <PageContainer>
        <h1 className="mb-6 font-heading text-2xl font-semibold">Wishlist</h1>
        <WishlistPageSkeleton />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <h1 className="mb-6 font-heading text-2xl font-semibold">Wishlist</h1>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load your wishlist.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  if (items.length === 0) {
    return (
      <PageContainer>
        <h1 className="mb-6 font-heading text-2xl font-semibold">Wishlist</h1>
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love and come back to them later."
          action={
            <Button asChild>
              <Link to={ROUTES.home}>Browse products</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Wishlist</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const product = mapWishlistItemToProduct(item)
          const inStock = item.stock > 0

          return (
            <ProductCard
              key={item.wishlistId}
              product={product}
              footerActions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isRemoving}
                    onClick={() => void removeFromWishlist(item.productId)}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                    disabled={!inStock || isMoving}
                    onClick={() => void moveToCart(item.productId)}
                  >
                    <ShoppingCart />
                    Move to cart
                  </Button>
                </div>
              }
            />
          )
        })}
      </div>
    </PageContainer>
  )
}
