import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterOption[]
  activeFilter?: string
  onFilterChange?: (value: string) => void
  activeCount?: number
  onClearFilters?: () => void
  actions?: ReactNode
  className?: string
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  activeFilter,
  onFilterChange,
  activeCount = 0,
  onClearFilters,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange ? (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search ?? ''}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-2">
          {activeCount > 0 && onClearFilters ? (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="size-3.5" />
              Clear ({activeCount})
            </Button>
          ) : null}
          {actions}
        </div>
      </div>

      {filters && filters.length > 0 && onFilterChange ? (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(filter.value)}
              className="rounded-full"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove?: () => void
}) {
  return (
    <Badge variant="secondary" className="gap-1 rounded-full pr-1">
      {label}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-muted"
          aria-label={`Remove ${label} filter`}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </Badge>
  )
}
