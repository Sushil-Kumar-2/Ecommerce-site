import { useEffect, useState } from 'react'

import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductFilterChips } from '@/features/products/components/ProductFilterChips'
import { ProductSearch } from '@/features/products/components/ProductSearch'
import type { Category } from '@/features/products/product.types'

interface DebouncedProductFiltersProps {
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  search?: string
  categories: Category[]
  isCategoriesLoading?: boolean
  onCategoryChange: (categoryId: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onRatingChange: (value: string) => void
  onSearchChange: (value: string) => void
  onClear: () => void
  className?: string
}

function DebouncedPriceFields({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
  ...filterProps
}: Omit<DebouncedProductFiltersProps, 'onSearchChange' | 'className' | 'search'>) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice ?? '')
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice ?? '')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localMinPrice !== (minPrice ?? '')) {
        onMinPriceChange(localMinPrice)
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [localMinPrice, minPrice, onMinPriceChange])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localMaxPrice !== (maxPrice ?? '')) {
        onMaxPriceChange(localMaxPrice)
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [localMaxPrice, maxPrice, onMaxPriceChange])

  return (
    <ProductFilters
      {...filterProps}
      minPrice={localMinPrice}
      maxPrice={localMaxPrice}
      onMinPriceChange={setLocalMinPrice}
      onMaxPriceChange={setLocalMaxPrice}
      onClear={onClear}
    />
  )
}

export function DebouncedProductFilters({
  categoryId,
  minPrice,
  maxPrice,
  rating,
  search,
  categories,
  isCategoriesLoading,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onRatingChange,
  onSearchChange,
  onClear,
  className,
}: DebouncedProductFiltersProps) {
  const priceFieldKey = `${minPrice ?? ''}-${maxPrice ?? ''}`

  return (
    <div className={className}>
      <div className="mb-4 space-y-3 lg:hidden">
        <ProductSearch value={search ?? ''} onChange={onSearchChange} />
      </div>
      <ProductFilterChips
        search={search}
        categoryId={categoryId}
        minPrice={minPrice}
        maxPrice={maxPrice}
        rating={rating}
        categories={categories}
        onRemoveSearch={() => onSearchChange('')}
        onRemoveCategory={() => onCategoryChange('')}
        onRemoveMinPrice={() => onMinPriceChange('')}
        onRemoveMaxPrice={() => onMaxPriceChange('')}
        onRemoveRating={() => onRatingChange('')}
        onClearAll={onClear}
      />
      <DebouncedPriceFields
        key={priceFieldKey}
        categoryId={categoryId}
        minPrice={minPrice}
        maxPrice={maxPrice}
        rating={rating}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        onCategoryChange={onCategoryChange}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
        onRatingChange={onRatingChange}
        onClear={onClear}
      />
    </div>
  )
}
