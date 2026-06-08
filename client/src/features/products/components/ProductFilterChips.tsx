import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/features/products/utils'
import type { Category } from '@/features/products/product.types'

interface ProductFilterChipsProps {
  search?: string
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  categories: Category[]
  onRemoveSearch: () => void
  onRemoveCategory: () => void
  onRemoveMinPrice: () => void
  onRemoveMaxPrice: () => void
  onRemoveRating: () => void
  onClearAll: () => void
}

export function ProductFilterChips({
  search,
  categoryId,
  minPrice,
  maxPrice,
  rating,
  categories,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveMinPrice,
  onRemoveMaxPrice,
  onRemoveRating,
  onClearAll,
}: ProductFilterChipsProps) {
  const categoryName = categories.find((entry) => entry._id === categoryId)?.name
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = []

  if (search) {
    chips.push({ key: 'search', label: `Search: ${search}`, onRemove: onRemoveSearch })
  }
  if (categoryName) {
    chips.push({ key: 'category', label: categoryName, onRemove: onRemoveCategory })
  }
  if (minPrice) {
    chips.push({
      key: 'minPrice',
      label: `Min ${formatPrice(Number(minPrice))}`,
      onRemove: onRemoveMinPrice,
    })
  }
  if (maxPrice) {
    chips.push({
      key: 'maxPrice',
      label: `Max ${formatPrice(Number(maxPrice))}`,
      onRemove: onRemoveMaxPrice,
    })
  }
  if (rating) {
    chips.push({ key: 'rating', label: `${rating}+ stars`, onRemove: onRemoveRating })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
            aria-label={`Remove ${chip.label} filter`}
            onClick={chip.onRemove}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      ) : null}
    </div>
  )
}
