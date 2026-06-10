import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
      <Select value={value} onValueChange={(next) => onChange(next as ProductSort)}>
        <SelectTrigger id="product-sort" size="sm" className="min-w-[180px]">
          <SelectValue placeholder="Sort products" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
