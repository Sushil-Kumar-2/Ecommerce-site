import { Link } from 'react-router-dom'
import { ArrowRight, Grid3X3 } from 'lucide-react'

import {
  HeroCarousel,
  ProductRow,
} from '@/components/storefront'
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
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
  const { data: bestSellers = [], isLoading: isBestSellersLoading } = useBestSellers()
  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProducts()
  const { data: topRated = [], isLoading: isTopRatedLoading } = useTopRatedProducts()
  const { data: recentlyViewed = [] } = useRecentlyViewed()

  const featuredProducts = featuredData?.data ?? []

  const recentProducts = mapRecentlyViewedToProducts(recentlyViewed)

  return (
    <div className="space-y-8 pb-10">
      <HeroCarousel />

      <section className="mx-auto max-w-7xl px-4">
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
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : bestSellers.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4">
          <ProductRow
            title="Best sellers"
            products={bestSellers}
            viewAllHref={ROUTES.products}
          />
        </div>
      ) : null}

      {isFeaturedLoading ? (
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : featuredProducts.length > 0 ? (
        <div className="mx-auto max-w-7xl">
          <ProductRow
            title="Featured deals"
            products={featuredProducts}
            viewAllHref={`${ROUTES.products}?featured=true`}
          />
        </div>
      ) : null}

      {isTopRatedLoading ? (
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : topRated.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4">
          <ProductRow
            title="Top rated"
            products={topRated}
            viewAllHref={`${ROUTES.products}?sort=top_rated`}
          />
        </div>
      ) : null}

      {recentProducts.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4">
          <ProductRow title="Recently viewed" products={recentProducts} />
        </div>
      ) : null}

      <section className="mx-auto max-w-7xl px-4">
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
