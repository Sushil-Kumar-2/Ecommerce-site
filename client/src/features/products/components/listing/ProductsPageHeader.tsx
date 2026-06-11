import { SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { BreadcrumbItemConfig } from '@/components/design-system'
import { cn } from '@/lib/utils'

interface ProductsPageHeaderProps {
  countLabel: string
  breadcrumbs: BreadcrumbItemConfig[]
  className?: string
  activeFilterCount?: number
  onOpenFilters?: () => void
}

export function ProductsPageHeader({
  countLabel,
  breadcrumbs,
  className,
  activeFilterCount = 0,
  onOpenFilters,
}: ProductsPageHeaderProps) {
  return (
    <header className={cn('mb-4 space-y-3', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
      <Breadcrumb className="min-w-0 text-xs text-muted-foreground">
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={`${item.label}-${index}`} className="contents">
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="font-normal text-muted-foreground">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast ? <BreadcrumbSeparator /> : null}
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <p className="hidden shrink-0 text-xs font-medium text-muted-foreground sm:block sm:text-sm">
        {countLabel}
      </p>
      </div>

      {onOpenFilters ? (
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="relative h-9 flex-1"
            onClick={onOpenFilters}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilterCount > 0 ? (
              <Badge className="ml-1 size-5 rounded-full p-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            ) : null}
          </Button>
          <p className="shrink-0 text-xs text-muted-foreground">{countLabel}</p>
        </div>
      ) : null}
    </header>
  )
}
