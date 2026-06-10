import { Home, PackageSearch, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/routes'

interface ProductListingEmptyProps {
  search?: string
  categoryName?: string
  onClearSearch?: () => void
  onBrowseAll?: () => void
}

export function ProductListingEmpty({
  search,
  categoryName,
  onClearSearch,
  onBrowseAll,
}: ProductListingEmptyProps) {
  if (search) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No results for "${search}"`}
        description="Try a different search term or clear your search to browse all products."
        action={
          onClearSearch ? (
            <Button type="button" onClick={onClearSearch}>
              Clear search
            </Button>
          ) : null
        }
        className="py-16"
      />
    )
  }

  if (categoryName) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={`No products in ${categoryName}`}
        description="This category is empty right now. Browse all products to discover more."
        action={
          onBrowseAll ? (
            <Button type="button" onClick={onBrowseAll}>
              Browse all products
            </Button>
          ) : (
            <Button asChild>
              <Link to={ROUTES.products}>Browse all products</Link>
            </Button>
          )
        }
        className="py-16"
      />
    )
  }

  return (
    <EmptyState
      icon={PackageSearch}
      title="No products found"
      description="Try adjusting your filters or check back later for new arrivals."
      action={
        <Button asChild>
          <Link to={ROUTES.home}>
            <Home className="size-4" />
            Go to home
          </Link>
        </Button>
      }
      className="py-16"
    />
  )
}
