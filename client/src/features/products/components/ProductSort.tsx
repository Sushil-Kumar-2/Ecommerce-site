import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { ProductSort } from '../product.types'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: ProductSort.NEWEST, label: 'Newest' },
  { value: ProductSort.PRICE_ASC, label: 'Price: Low to High' },
  { value: ProductSort.PRICE_DESC, label: 'Price: High to Low' },
  { value: ProductSort.TOP_RATED, label: 'Top Rated' },
]

interface ProductSortSelectProps {
  value: ProductSort
  onChange: (value: ProductSort) => void
  className?: string
}

export function ProductSortSelect({ value, onChange, className }: ProductSortSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="product-sort">Sort by</Label>
      <select
        id="product-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as ProductSort)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
