import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { SectionError } from '@/components/common/SectionError'
import {
  BackToTop,
  HeroCarousel,
  HomeCategoryCard,
  ProductImageStrip,
  ProductRow,
} from '@/components/storefront'
import { Skeleton } from '@/components/ui/skeleton'
import { useHomeRecentlyViewed } from '@/features/recently-viewed'
import {
  useBestSellers,
  useFeaturedProducts,
  useHomeCategories,
  useHomeCategoryProducts,
  useTopRatedProducts,
} from '@/features/products/hooks'
import type { Category, Product } from '@/features/products/product.types'
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

function productsForCategory(products: Product[], categoryId: string, limit = 4) {
  return products.filter((product) => product.categoryId === categoryId).slice(0, limit)
}

function isActiveCategory(category: Category) {
  return category.isActive !== false && category.status !== 'inactive'
}

function buildCategoryCards(categories: Category[], products: Product[]) {
  return categories
    .filter(isActiveCategory)
    .map((category) => ({
      category,
      products: productsForCategory(products, category._id),
    }))
    .filter((entry) => entry.products.length >= 4)
    .slice(0, 8)
}

export function HomePage() {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useHomeCategories()
  const {
    data: bestSellers = [],
    error: bestSellersError,
    refetch: refetchBestSellers,
  } = useBestSellers()
  const {
    data: featuredData,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts()
  const {
    data: topRated = [],
    error: topRatedError,
    refetch: refetchTopRated,
  } = useTopRatedProducts()
  const {
    items: recentlyViewed,
    showOnHomepage: showRecentlyViewed,
  } = useHomeRecentlyViewed()
  const {
    data: homeCatalogData,
    isLoading: isHomeCatalogLoading,
    error: homeCatalogError,
    refetch: refetchHomeCatalog,
  } = useHomeCategoryProducts()

  const featuredProducts = featuredData?.data ?? []
  const recentProducts = mapRecentlyViewedToProducts(recentlyViewed)
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories])
  const allProducts = homeCatalogData?.data ?? []

  const categoryCards = useMemo(
    () => buildCategoryCards(categories, allProducts),
    [categories, allProducts],
  )

  const isCatalogLoading =
    isCategoriesLoading || isHomeCatalogLoading

  const rowOne = categoryCards.slice(0, 4)
  const rowTwo = categoryCards.slice(4, 8)

  return (
    <div className="bg-muted/40 pb-10">
      <HeroCarousel />

      <div className="relative z-10 mx-auto max-w-7xl space-y-5 px-3 pt-4 sm:px-4 md:-mt-10 md:space-y-6 md:pt-0">
        {isCatalogLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-sm" />
            ))}
          </div>
        ) : categoriesError || homeCatalogError ? (
          <SectionError
            message="Failed to load homepage products."
            onRetry={() => {
              void refetchCategories()
              void refetchHomeCatalog()
            }}
          />
        ) : rowOne.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rowOne.map(({ category, products }) => (
              <HomeCategoryCard
                key={category._id}
                title={`${category.name} | Top picks`}
                href={`${ROUTES.products}?categoryId=${category._id}`}
                products={products}
                category={category}
              />
            ))}
          </div>
        ) : null}

        {bestSellersError ? (
          <SectionError
            message="Failed to load best sellers."
            onRetry={() => void refetchBestSellers()}
          />
        ) : bestSellers.length > 0 ? (
          <ProductImageStrip
            title="Best sellers in store"
            products={bestSellers}
            viewAllHref={ROUTES.products}
          />
        ) : null}

        {showRecentlyViewed ? (
          <ProductImageStrip
            title="Inspired by your browsing history"
            products={recentProducts}
          />
        ) : null}

        {rowTwo.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rowTwo.map(({ category, products }) => (
              <HomeCategoryCard
                key={category._id}
                title={`Deals on ${category.name}`}
                href={`${ROUTES.products}?categoryId=${category._id}`}
                products={products}
                category={category}
              />
            ))}
          </div>
        ) : null}

        {featuredError ? (
          <SectionError
            message="Failed to load featured deals."
            onRetry={() => void refetchFeatured()}
          />
        ) : featuredProducts.length > 0 ? (
          <div className="rounded-sm bg-card p-4 shadow-sm ring-1 ring-border/40">
            <ProductRow
              title="Featured deals"
              products={featuredProducts}
              categoryMap={categoryMap}
              viewAllHref={`${ROUTES.products}?featured=true`}
              className="[&>div:first-child]:px-0 [&_.relative]:px-0"
            />
          </div>
        ) : null}

        {topRatedError ? (
          <SectionError
            message="Failed to load top rated products."
            onRetry={() => void refetchTopRated()}
          />
        ) : topRated.length > 0 ? (
          <ProductImageStrip
            title="Top rated for you"
            products={topRated}
            viewAllHref={`${ROUTES.products}?sort=top_rated`}
          />
        ) : null}

        <section className="rounded-sm bg-card p-6 text-center shadow-sm ring-1 ring-border/40 sm:p-8">
          <h2 className="font-heading text-xl font-bold sm:text-2xl">
            Explore thousands of products
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Great prices, fast delivery, and secure checkout on ShopKart.
          </p>
          <Link
            to={ROUTES.products}
            className="mt-4 inline-flex rounded-sm bg-brand-accent px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-brand-accent/90"
          >
            Start shopping
          </Link>
        </section>
      </div>

      <BackToTop />
    </div>
  )
}
