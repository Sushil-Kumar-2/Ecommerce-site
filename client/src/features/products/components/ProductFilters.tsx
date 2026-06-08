import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { Category } from '../product.types'

interface ProductFiltersProps {
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
}

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4+ stars' },
  { value: '3', label: '3+ stars' },
  { value: '2', label: '2+ stars' },
  { value: '1', label: '1+ stars' },
]

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function ProductFilters({
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
}: ProductFiltersProps) {
  const hasActiveFilters = Boolean(categoryId || minPrice || maxPrice || rating)

  return (
    <aside
      className={cn(
        'space-y-4 rounded-xl border bg-card p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Filters</h2>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-filter">Category</Label>
        <select
          id="category-filter"
          value={categoryId ?? ''}
          disabled={isCategoriesLoading}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="min-price">Min price</Label>
          <input
            id="min-price"
            type="number"
            min="0"
            step="0.01"
            value={minPrice ?? ''}
            onChange={(event) => onMinPriceChange(event.target.value)}
            placeholder="0"
            className={selectClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price">Max price</Label>
          <input
            id="max-price"
            type="number"
            min="0"
            step="0.01"
            value={maxPrice ?? ''}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            placeholder="Any"
            className={selectClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rating-filter">Minimum rating</Label>
        <select
          id="rating-filter"
          value={rating ?? ''}
          onChange={(event) => onRatingChange(event.target.value)}
          className={selectClassName}
        >
          {RATING_OPTIONS.map((option) => (
            <option key={option.value || 'any'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}
