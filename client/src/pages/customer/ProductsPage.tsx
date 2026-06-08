import { PackageSearch, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DebouncedProductFilters } from '@/features/products/components/DebouncedProductFilters'
import { ProductFilterChips } from '@/features/products/components/ProductFilterChips'
import { Pagination } from '@/features/products/components/Pagination'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { ProductSearch } from '@/features/products/components/ProductSearch'
import { ProductSortSelect } from '@/features/products/components/ProductSort'
import {
  useCategories,
  useProductFilterUpdater,
  useProductFiltersFromUrl,
  useProductsCatalog,
} from '@/features/products/hooks'
import { ProductSort } from '@/features/products/product.types'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function ProductsPage() {
  const filters = useProductFiltersFromUrl()
  const updateFilters = useProductFilterUpdater()
  const { data, error, isLoading, refetch } = useProductsCatalog()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()

  const products = data?.data ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? products.length

  const filterProps = {
    categoryId: filters.categoryId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    rating: filters.rating,
    search: filters.search,
    categories,
    isCategoriesLoading,
    onCategoryChange: (categoryId: string) => updateFilters({ categoryId }),
    onMinPriceChange: (minPrice: string) => updateFilters({ minPrice }),
    onMaxPriceChange: (maxPrice: string) => updateFilters({ maxPrice }),
    onRatingChange: (rating: string) => updateFilters({ rating }),
    onSearchChange: (search: string) => updateFilters({ search }),
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

  const resultLabel = filters.search
    ? `Showing ${total} results for "${filters.search}"`
    : `Showing ${total} products`

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.home}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold sm:text-2xl">
            {filters.search ? `Results for "${filters.search}"` : 'All products'}
          </h1>
          <p className="text-sm text-muted-foreground">{resultLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <DebouncedProductFilters {...filterProps} />
              </div>
            </SheetContent>
          </Sheet>
          <ProductSortSelect
            value={filters.sort ?? ProductSort.NEWEST}
            onChange={(sort) => updateFilters({ sort }, false)}
            className="max-w-[180px]"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <DebouncedProductFilters {...filterProps} />
        </div>

        <div className="space-y-6">
          <div className="hidden lg:block">
            <ProductSearch
              value={filters.search ?? ''}
              onChange={filterProps.onSearchChange}
            />
          </div>
          <div className="hidden lg:block">
            <ProductFilterChips
              search={filters.search}
              categoryId={filters.categoryId}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              rating={filters.rating}
              categories={categories}
              onRemoveSearch={() => filterProps.onSearchChange('')}
              onRemoveCategory={() => filterProps.onCategoryChange('')}
              onRemoveMinPrice={() => filterProps.onMinPriceChange('')}
              onRemoveMaxPrice={() => filterProps.onMaxPriceChange('')}
              onRemoveRating={() => filterProps.onRatingChange('')}
              onClearAll={filterProps.onClear}
            />
          </div>
          {error ? (
            <ErrorState
              message={getApiErrorMessage(error, 'Failed to load products.')}
              onRetry={() => void refetch()}
            />
          ) : null}

          {!error && isLoading ? <ProductGrid isLoading /> : null}

          {!error && !isLoading && products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try adjusting your search or filters to find what you are looking for."
            />
          ) : null}

          {!error && products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {pagination ? (
                <Pagination
                  pagination={pagination}
                  onPageChange={(page) => updateFilters({ page: String(page) }, false)}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
