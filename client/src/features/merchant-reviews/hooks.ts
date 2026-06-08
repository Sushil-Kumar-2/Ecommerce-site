import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth'
import { useGetMyProductsQuery } from '@/features/merchant-products/merchantProductsApi'
import { UserRole } from '@/types/auth.types'
import { env } from '@/lib/env'

import type { MerchantReviewItem, ProductReview } from './merchant-review.types'

async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const response = await fetch(`${env.apiUrl}/reviews/product/${productId}`)
  if (!response.ok) return []
  return response.json() as Promise<ProductReview[]>
}

export function useMerchantReviews() {
  const { isAuthenticated, user } = useAuth()
  const isMerchant = isAuthenticated && user?.role === UserRole.MERCHANT
  const { data: products = [], isLoading: isProductsLoading } = useGetMyProductsQuery(
    undefined,
    { skip: !isMerchant },
  )

  const [reviews, setReviews] = useState<MerchantReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isMerchant || products.length === 0) {
      setReviews([])
      return
    }

    let cancelled = false

    const loadReviews = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await Promise.all(
          products.map(async (product) => {
            const productReviews = await fetchProductReviews(product._id)
            return productReviews.map((review) => ({
              ...review,
              productTitle: product.title,
            }))
          }),
        )

        if (!cancelled) {
          const merged = results
            .flat()
            .sort(
              (a, b) =>
                new Date(b.createdAt ?? 0).getTime() -
                new Date(a.createdAt ?? 0).getTime(),
            )
          setReviews(merged)
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [isMerchant, products, refreshKey])

  const refetch = () => {
    setRefreshKey((value) => value + 1)
  }

  return {
    reviews,
    isLoading: isProductsLoading || isLoading,
    error,
    refetch,
  }
}
