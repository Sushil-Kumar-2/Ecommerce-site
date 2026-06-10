import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ProductPagination } from '../product.types'

interface PaginationProps {
  pagination: ProductPagination
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  pages.push(total)
  return pages
}

export function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) {
    return null
  }

  const pages = getPageNumbers(page, totalPages)

  return (
    <nav
      aria-label="Product pagination"
      className={cn('mt-10 border-t border-border/60 pt-8', className)}
    >
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total.toLocaleString()} products
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-lg border-border/80 shadow-sm transition-colors hover:border-brand-primary/40 hover:bg-muted"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {pages.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex size-9 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'size-9 min-w-9 rounded-lg p-0 text-sm font-medium shadow-sm transition-all',
                  item === page
                    ? 'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90'
                    : 'border-border/80 bg-background text-foreground hover:border-brand-primary/40 hover:bg-muted',
                )}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-lg border-border/80 shadow-sm transition-colors hover:border-brand-primary/40 hover:bg-muted"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
