import { LayoutGrid, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ProductSearch } from '@/features/products/components/ProductSearch'
import { ProductSortSelect } from '@/features/products/components/ProductSort'
import type { ProductSort } from '@/features/products/product.types'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'

interface ProductsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: ProductSort
  onSortChange: (value: ProductSort) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export function ProductsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  className,
}: ProductsToolbarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-30 -mx-4 border-b bg-background/95 px-4 py-2.5 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <ProductSearch value={search} onChange={onSearchChange} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <ProductSortSelect
            value={sort}
            onChange={onSortChange}
            className="min-w-[180px] space-y-0 [&_label]:sr-only"
          />

          <div className="flex items-center rounded-lg border bg-card p-0.5 shadow-sm">
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              onClick={() => onViewModeChange('list')}
            >
              <List />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
