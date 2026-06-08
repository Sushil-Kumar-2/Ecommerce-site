import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/features/products'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/routes'

interface CategoryNavProps {
  className?: string
}

export function CategoryNav({ className }: CategoryNavProps) {
  const { data: categories = [], isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto px-4 py-2', className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <nav
      className={cn(
        'flex gap-1 overflow-x-auto border-b bg-background px-4 py-2 scrollbar-none',
        className,
      )}
      aria-label="Categories"
    >
      {categories.map((category) => (
        <Link
          key={category._id}
          to={`${ROUTES.products}?categoryId=${category._id}`}
          className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
}
