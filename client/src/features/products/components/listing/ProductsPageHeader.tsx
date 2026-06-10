import { Link } from 'react-router-dom'

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
}

export function ProductsPageHeader({
  countLabel,
  breadcrumbs,
  className,
}: ProductsPageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-4 flex items-center justify-between gap-3 border-b border-border/50 pb-3',
        className,
      )}
    >
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

      <p className="shrink-0 text-xs font-medium text-muted-foreground sm:text-sm">
        {countLabel}
      </p>
    </header>
  )
}
