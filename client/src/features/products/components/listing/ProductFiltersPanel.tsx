import { LayoutGrid, List, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ProductSearch } from '@/features/products/components/ProductSearch'
import { ProductSortSelect } from '@/features/products/components/ProductSort'
import type { Category, ProductSort } from '@/features/products/product.types'
import { formatPrice } from '@/features/products/utils'
import { cn } from '@/lib/utils'

const PRICE_MAX = 50000

const RATING_OPTIONS = [
  { value: '', minRating: 0, label: 'Any rating' },
  { value: '4', minRating: 4, label: '4 & up' },
  { value: '3', minRating: 3, label: '3 & up' },
  { value: '2', minRating: 2, label: '2 & up' },
  { value: '1', minRating: 1, label: '1 & up' },
] as const

type ViewMode = 'grid' | 'list'

function RatingStarsRow({ minRating }: { minRating: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'size-3.5 shrink-0',
            index < minRating
              ? 'fill-rating text-rating'
              : 'fill-muted/40 text-muted-foreground/40',
          )}
        />
      ))}
    </span>
  )
}

interface ProductFiltersPanelProps {
  search?: string
  onSearchChange?: (value: string) => void
  sort?: ProductSort
  onSortChange?: (value: ProductSort) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  categories: Category[]
  isCategoriesLoading?: boolean
  onCategoryChange: (categoryId: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onRatingChange: (value: string) => void
  onClear: () => void
  className?: string
  sticky?: boolean
  embedded?: boolean
}

export function ProductFiltersPanel({
  search = '',
  onSearchChange,
  sort,
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  categoryId,
  minPrice,
  maxPrice,
  rating,
  categories,
  isCategoriesLoading = false,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onRatingChange,
  onClear,
  className,
  sticky = true,
  embedded = false,
}: ProductFiltersPanelProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(minPrice) || 0,
    Number(maxPrice) || PRICE_MAX,
  ])

  useEffect(() => {
    setPriceRange([Number(minPrice) || 0, Number(maxPrice) || PRICE_MAX])
  }, [minPrice, maxPrice])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const [min, max] = priceRange
      const nextMin = min > 0 ? String(min) : ''
      const nextMax = max < PRICE_MAX ? String(max) : ''
      if (nextMin !== (minPrice ?? '')) onMinPriceChange(nextMin)
      if (nextMax !== (maxPrice ?? '')) onMaxPriceChange(nextMax)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [priceRange, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange])

  const activeCount = useMemo(() => {
    let count = 0
    if (search) count += 1
    if (categoryId) count += 1
    if (minPrice) count += 1
    if (maxPrice) count += 1
    if (rating) count += 1
    return count
  }, [search, categoryId, minPrice, maxPrice, rating])

  const filtersHeader = !embedded ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-sm font-semibold">Filters</h2>
        {activeCount > 0 ? (
          <Badge variant="secondary" className="rounded-full">
            {activeCount}
          </Badge>
        ) : null}
      </div>
      {activeCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      ) : null}
    </div>
  ) : null

  const filtersBody = (
    <>
      <div className="space-y-4 border-b border-border/60 pb-4">
        {onSearchChange ? (
          <div className="space-y-2">
            <Label htmlFor="sidebar-product-search" className="text-xs font-medium text-muted-foreground">
              Search
            </Label>
            <ProductSearch
              value={search}
              onChange={onSearchChange}
              placeholder="Search products..."
            />
          </div>
        ) : null}

        {sort && onSortChange ? (
          <ProductSortSelect
            value={sort}
            onChange={onSortChange}
            className="w-full space-y-2 [&_label]:text-xs [&_label]:font-medium [&_label]:text-muted-foreground"
          />
        ) : null}

        {onViewModeChange ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">View</Label>
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 flex-1"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                onClick={() => onViewModeChange('grid')}
              >
                <LayoutGrid className="size-4" />
                Grid
              </Button>
              <Button
                type="button"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 flex-1"
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                onClick={() => onViewModeChange('list')}
              >
                <List className="size-4" />
                List
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Accordion
        type="multiple"
        defaultValue={['category', 'price', 'rating']}
        className="mt-4 w-full"
      >
        <AccordionItem value="category" className="border-border/60">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-0.5 text-sm transition-colors hover:text-foreground">
                <input
                  type="radio"
                  name="category-filter"
                  checked={!categoryId}
                  onChange={() => onCategoryChange('')}
                  className="size-4 shrink-0 accent-brand-primary"
                />
                <span>All categories</span>
              </label>
              {isCategoriesLoading ? (
                <p className="px-1 text-sm text-muted-foreground">Loading categories...</p>
              ) : (
                categories.map((category) => (
                  <label
                    key={category._id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-0.5 text-sm transition-colors hover:text-foreground"
                  >
                    <input
                      type="radio"
                      name="category-filter"
                      checked={categoryId === category._id}
                      onChange={() => onCategoryChange(category._id)}
                      className="size-4 shrink-0 accent-brand-primary"
                    />
                    <span className="leading-snug">{category.name}</span>
                  </label>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-border/60">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Price range
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4 px-1">
              <Slider
                min={0}
                max={PRICE_MAX}
                step={500}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating" className="border-border/60">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Rating
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.value || 'any'}
                  type="button"
                  onClick={() => onRatingChange(option.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted/80',
                    rating === option.value && 'bg-muted font-medium ring-1 ring-border/60',
                  )}
                >
                  {option.minRating > 0 ? (
                    <>
                      <RatingStarsRow minRating={option.minRating} />
                      <span className="whitespace-nowrap text-muted-foreground">& up</span>
                    </>
                  ) : (
                    <span>{option.label}</span>
                  )}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )

  const filtersFooter = !embedded ? (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClear}
      disabled={activeCount === 0}
    >
      Clear all filters
    </Button>
  ) : null

  return (
    <aside
      className={cn(
        'w-full lg:w-[260px]',
        sticky &&
          !embedded &&
          'lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start',
        className,
      )}
    >
      {embedded ? (
        filtersBody
      ) : (
        <div className="flex max-h-[inherit] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          {filtersHeader ? (
            <div className="shrink-0 border-b border-border/60 px-5 py-4">{filtersHeader}</div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [scrollbar-gutter:stable]">
            {filtersBody}
          </div>
          {filtersFooter ? (
            <div className="shrink-0 border-t border-border/60 px-5 py-4">{filtersFooter}</div>
          ) : null}
        </div>
      )}
    </aside>
  )
}
