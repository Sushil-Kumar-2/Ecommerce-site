import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { ErrorState } from '@/components/common/ErrorState'
import { PageShell } from '@/components/design-system'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ProductFilterChips } from '@/features/products/components/ProductFilterChips'
import { Pagination } from '@/features/products/components/Pagination'
import {
  ProductFiltersPanel,
  ProductListingEmpty,
  ProductListingGrid,
  ProductListingSkeleton,
  ProductsPageHeader,
  useProductsViewMode,
} from '@/features/products/components/listing'
import {
  useCategories,
  useProductFilterUpdater,
  useProductFiltersFromUrl,
  useProductsCatalog,
} from '@/features/products/hooks'
import { ProductSort } from '@/features/products/product.types'
import { buildCategoryMap } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function getActiveFilterCount(filters: {
  search?: string
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
}): number {
  let count = 0
  if (filters.search) count += 1
  if (filters.categoryId) count += 1
  if (filters.minPrice) count += 1
  if (filters.maxPrice) count += 1
  if (filters.rating) count += 1
  return count
}

export function ProductsPage() {
  const filters = useProductFiltersFromUrl()
  const updateFilters = useProductFilterUpdater()
  const { data, error, isLoading, refetch } = useProductsCatalog()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
  const [viewMode, setViewMode] = useProductsViewMode()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const products = data?.data ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? products.length
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories])

  const filterProps = {
    search: filters.search ?? '',
    onSearchChange: (search: string) => updateFilters({ search }),
    sort: filters.sort ?? ProductSort.NEWEST,
    onSortChange: (sort: ProductSort) => updateFilters({ sort }, false),
    viewMode,
    onViewModeChange: setViewMode,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    rating: filters.rating,
    categories,
    isCategoriesLoading,
    onCategoryChange: (categoryId: string) => updateFilters({ categoryId }),
    onMinPriceChange: (minPrice: string) => updateFilters({ minPrice }),
    onMaxPriceChange: (maxPrice: string) => updateFilters({ maxPrice }),
    onRatingChange: (rating: string) => updateFilters({ rating }),
    onClear: () =>
      updateFilters(
        {
          search: undefined,
          categoryId: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          rating: undefined,
        },
        false,
      ),
  }

  const activeFilterCount = getActiveFilterCount(filters)

  const activeCategory = filters.categoryId
    ? categories.find((category) => category._id === filters.categoryId)
    : undefined

  const countLabel = filters.search
    ? `Showing ${total} results for "${filters.search}"`
    : `Showing ${total} products`

  const breadcrumbs = [
    { label: 'Home', href: ROUTES.home },
    ...(activeCategory
      ? [{ label: 'Products', href: ROUTES.products }, { label: activeCategory.name }]
      : [{ label: 'Products' }]),
  ]

  const animationKey = [
    filters.search,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.sort,
    filters.page,
    viewMode,
  ].join('|')

  const PageContent = prefersReducedMotion ? 'div' : motion.div
  const pageMotionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25 },
      }

  return (
    <PageShell className="pt-4 sm:pt-5">
      <PageContent {...pageMotionProps}>
        <ProductsPageHeader
          countLabel={countLabel}
          breadcrumbs={breadcrumbs}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        {error ? (
          <ErrorState
            message={getApiErrorMessage(error, 'Failed to load products.')}
            onRetry={() => void refetch()}
            className="mt-4"
          />
        ) : null}

        {!error && isLoading ? <ProductListingSkeleton className="mt-4" /> : null}

        {!error && !isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="hidden lg:block">
              <ProductFiltersPanel {...filterProps} />
            </div>

            <div className="space-y-4 pb-4 lg:pb-0">
              <ProductFilterChips
                search={filters.search}
                categoryId={filters.categoryId}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                rating={filters.rating}
                categories={categories}
                onRemoveSearch={() => updateFilters({ search: undefined })}
                onRemoveCategory={() => updateFilters({ categoryId: undefined })}
                onRemoveMinPrice={() => updateFilters({ minPrice: undefined })}
                onRemoveMaxPrice={() => updateFilters({ maxPrice: undefined })}
                onRemoveRating={() => updateFilters({ rating: undefined })}
                onClearAll={filterProps.onClear}
              />

              {products.length === 0 ? (
                <ProductListingEmpty
                  search={filters.search}
                  categoryName={activeCategory?.name}
                  onClearSearch={() => updateFilters({ search: undefined })}
                  onBrowseAll={() =>
                    updateFilters(
                      {
                        categoryId: undefined,
                        search: undefined,
                        minPrice: undefined,
                        maxPrice: undefined,
                        rating: undefined,
                      },
                      false,
                    )
                  }
                />
              ) : (
                <>
                  <ProductListingGrid
                    products={products}
                    categoryMap={categoryMap}
                    viewMode={viewMode}
                    animationKey={animationKey}
                  />
                  {pagination ? (
                    <Pagination
                      pagination={pagination}
                      onPageChange={(page) => updateFilters({ page: String(page) }, false)}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </PageContent>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="flex h-[85vh] max-h-[85vh] flex-col rounded-t-2xl p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProductFiltersPanel {...filterProps} sticky={false} embedded />
          </div>
          <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                filterProps.onClear()
              }}
            >
              Clear
            </Button>
            <Button type="button" className="flex-1" onClick={() => setFiltersOpen(false)}>
              Show results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
