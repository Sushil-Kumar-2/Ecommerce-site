import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  useGetBestSellersQuery,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetRelatedProductsQuery,
  useGetTopRatedProductsQuery,
} from './productsApi'
import { ProductSort, type ProductFilterParams } from './product.types'

const DEFAULT_LIMIT = '12'

export function useProductFiltersFromUrl(): ProductFilterParams {
  const [searchParams] = useSearchParams()

  return useMemo(
    () => ({
      search: searchParams.get('search') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      minPrice: searchParams.get('minPrice') ?? undefined,
      maxPrice: searchParams.get('maxPrice') ?? undefined,
      rating: searchParams.get('rating') ?? undefined,
      sort: (searchParams.get('sort') as ProductSort | null) ?? ProductSort.NEWEST,
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? DEFAULT_LIMIT,
      featured: searchParams.get('featured') ?? undefined,
    }),
    [searchParams],
  )
}

export function useProductsCatalog() {
  const filters = useProductFiltersFromUrl()
  return useGetProductsQuery(filters)
}

export function useProductDetail(productId: string | undefined) {
  return useGetProductByIdQuery(productId ?? '', {
    skip: !productId,
  })
}

export function useRelatedProducts(productId: string | undefined) {
  return useGetRelatedProductsQuery(productId ?? '', {
    skip: !productId,
  })
}

export function useTopRatedProducts() {
  return useGetTopRatedProductsQuery()
}

export function useBestSellers() {
  return useGetBestSellersQuery()
}

export function useCategories() {
  return useGetCategoriesQuery()
}

export function useFeaturedProducts() {
  return useGetProductsQuery({
    featured: 'true',
    limit: '12',
    page: '1',
  })
}

export function useProductFilterUpdater() {
  const [searchParams, setSearchParams] = useSearchParams()

  return useCallback(
    (updates: Partial<ProductFilterParams>, resetPage = true) => {
      const next = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })

      if (resetPage) {
        next.set('page', '1')
      }

      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )
}
