import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Grid3X3 } from 'lucide-react'

import { SectionError } from '@/components/common/SectionError'
import { HeroCarousel, ProductRow } from '@/components/storefront'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentlyViewed } from '@/features/recently-viewed'
import {
  useBestSellers,
  useCategories,
  useFeaturedProducts,
  useTopRatedProducts,
} from '@/features/products/hooks'
import type { Product } from '@/features/products/product.types'
import { buildCategoryMap } from '@/features/products/utils'
import { ROUTES } from '@/utils/routes'

function mapRecentlyViewedToProducts(
  items: Array<{
    productId: string
    title: string
    image: string | null
    price: number
    discountPrice: number
    stock: number
    averageRating: number
    totalReviews: number
  }>,
): Product[] {
  return items.map((item) => ({
    _id: item.productId,
    title: item.title,
    slug: '',
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
  }))
}

export function HomePage() {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories()
  const {
    data: bestSellers = [],
    isLoading: isBestSellersLoading,
    error: bestSellersError,
    refetch: refetchBestSellers,
  } = useBestSellers()
  const {
    data: featuredData,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts()
  const {
    data: topRated = [],
    isLoading: isTopRatedLoading,
    error: topRatedError,
    refetch: refetchTopRated,
  } = useTopRatedProducts()
  const { data: recentlyViewed = [] } = useRecentlyViewed()

  const featuredProducts = featuredData?.data ?? []
  const recentProducts = mapRecentlyViewedToProducts(recentlyViewed)
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories])

  return (
    <div className="space-y-8 pb-10">
      <HeroCarousel />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Shop by category</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.products}>
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        {isCategoriesLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : categoriesError ? (
          <SectionError
            message="Failed to load categories."
            onRetry={() => void refetchCategories()}
          />
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No categories available.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category._id}
                to={`${ROUTES.products}?categoryId=${category._id}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-shadow hover:shadow-md"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-brand-primary/10">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <Grid3X3 className="size-6 text-brand-primary" />
                  )}
                </div>
                <span className="line-clamp-2 text-xs font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {isBestSellersLoading ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : bestSellersError ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionError
            message="Failed to load best sellers."
            onRetry={() => void refetchBestSellers()}
          />
        </div>
      ) : bestSellers.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductRow
            title="Best sellers"
            products={bestSellers}
            categoryMap={categoryMap}
            viewAllHref={ROUTES.products}
          />
        </div>
      ) : null}

      {isFeaturedLoading ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : featuredError ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionError
            message="Failed to load featured deals."
            onRetry={() => void refetchFeatured()}
          />
        </div>
      ) : featuredProducts.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductRow
            title="Featured deals"
            products={featuredProducts}
            categoryMap={categoryMap}
            viewAllHref={`${ROUTES.products}?featured=true`}
          />
        </div>
      ) : null}

      {isTopRatedLoading ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : topRatedError ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionError
            message="Failed to load top rated products."
            onRetry={() => void refetchTopRated()}
          />
        </div>
      ) : topRated.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductRow
            title="Top rated"
            products={topRated}
            categoryMap={categoryMap}
            viewAllHref={`${ROUTES.products}?sort=top_rated`}
          />
        </div>
      ) : null}

      {recentProducts.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductRow
            title="Recently viewed"
            products={recentProducts}
            categoryMap={categoryMap}
          />
        </div>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-brand-primary p-8 text-center text-white">
          <h2 className="font-heading text-2xl font-bold">Explore thousands of products</h2>
          <p className="mt-2 text-white/80">
            Great prices, fast delivery, and secure checkout.
          </p>
          <Button asChild className="mt-4 bg-brand-accent text-foreground hover:bg-brand-accent/90">
            <Link to={ROUTES.products}>Start shopping</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
