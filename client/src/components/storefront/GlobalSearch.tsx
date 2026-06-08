import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetProductsQuery } from '@/features/products/productsApi'
import { getProductImage, getProductRoute } from '@/features/products/utils'
import { ROUTES } from '@/utils/routes'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  query?: string
  onQueryChange?: (value: string) => void
}

export function GlobalSearch({
  className,
  placeholder = 'Search for products, brands and more',
  query: controlledQuery,
  onQueryChange,
}: GlobalSearchProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const [internalQuery, setInternalQuery] = useState(urlSearch)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const query = controlledQuery ?? internalQuery
  const setQuery = onQueryChange ?? setInternalQuery

  useEffect(() => {
    setQuery(urlSearch)
  }, [urlSearch, setQuery])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data: suggestionsData, isFetching } = useGetProductsQuery(
    { search: debouncedQuery, limit: '5', page: '1' },
    { skip: debouncedQuery.length < 2 },
  )

  const suggestions = suggestionsData?.data ?? []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigateToSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim()
      if (!trimmed) return
      setIsOpen(false)
      setHighlightIndex(-1)
      navigate(`${ROUTES.products}?search=${encodeURIComponent(trimmed)}`)
    },
    [navigate],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (highlightIndex >= 0 && suggestions[highlightIndex]) {
      navigate(getProductRoute(suggestions[highlightIndex]._id))
      setIsOpen(false)
      return
    }
    navigateToSearch(query)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((index) => Math.min(index + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((index) => Math.max(index - 1, -1))
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setHighlightIndex(-1)
    }
  }

  const showDropdown = isOpen && debouncedQuery.length >= 2

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-0">
        <div className="relative flex-1">
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setIsOpen(true)
              setHighlightIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-9 rounded-r-none border-brand-primary/20 pr-10 focus-visible:border-brand-primary focus-visible:ring-brand-primary/30"
            aria-label="Search products"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            role="combobox"
          />
        </div>
        <Button
          type="submit"
          className="h-9 rounded-l-none bg-brand-primary px-4 hover:bg-brand-primary/90"
          aria-label="Search"
        >
          <Search />
        </Button>
      </form>

      {showDropdown ? (
        <div
          className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg"
          role="listbox"
        >
          {isFetching && suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching...</p>
          ) : null}
          {!isFetching && suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No products found</p>
          ) : null}
          {suggestions.map((product, index) => {
            const image = getProductImage(product.images)
            return (
              <button
                key={product._id}
                type="button"
                role="option"
                aria-selected={highlightIndex === index}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                  highlightIndex === index && 'bg-muted',
                )}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => {
                  navigate(getProductRoute(product._id))
                  setIsOpen(false)
                }}
              >
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-white">
                  {image ? (
                    <img src={image} alt="" className="size-full object-contain p-0.5" />
                  ) : (
                    <Search className="size-4 text-muted-foreground" />
                  )}
                </div>
                <span className="line-clamp-2 flex-1">{product.title}</span>
              </button>
            )
          })}
          {suggestions.length > 0 ? (
            <button
              type="button"
              className="w-full border-t px-4 py-2 text-left text-sm font-medium text-brand-primary hover:bg-muted"
              onClick={() => navigateToSearch(query)}
            >
              See all results for &quot;{query.trim()}&quot;
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
