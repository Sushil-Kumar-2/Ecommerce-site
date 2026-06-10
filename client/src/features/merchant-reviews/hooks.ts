import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/features/auth'
import { useGetMyProductsQuery } from '@/features/merchant-products/merchantProductsApi'
import { UserRole } from '@/types/auth.types'
import { env } from '@/lib/env'

import type { MerchantReviewItem, ProductReview } from './merchant-review.types'

const BATCH_SIZE = 5

async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const response = await fetch(`${env.apiUrl}/reviews/product/${productId}`)
  if (!response.ok) return []
  return response.json() as Promise<ProductReview[]>
}

async function fetchReviewsInBatches(
  productIds: Array<{ id: string; title: string }>,
): Promise<MerchantReviewItem[]> {
  const allReviews: MerchantReviewItem[] = []

  for (let index = 0; index < productIds.length; index += BATCH_SIZE) {
    const batch = productIds.slice(index, index + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (product) => {
        const productReviews = await fetchProductReviews(product.id)
        return productReviews.map((review) => ({
          ...review,
          productTitle: product.title,
        }))
      }),
    )
    allReviews.push(...batchResults.flat())
  }

  return allReviews.sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  )
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

  const productIds = useMemo(
    () => products.map((product) => ({ id: product._id, title: product.title })),
    [products],
  )

  useEffect(() => {
    if (!isMerchant || productIds.length === 0) {
      setReviews([])
      return
    }

    let cancelled = false

    const loadReviews = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const merged = await fetchReviewsInBatches(productIds)
        if (!cancelled) setReviews(merged)
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
  }, [isMerchant, productIds, refreshKey])

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
