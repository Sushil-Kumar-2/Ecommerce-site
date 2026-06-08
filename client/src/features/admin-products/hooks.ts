import { toast } from 'sonner'

import { useIsAdmin } from '@/features/admin/hooks'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useApproveAdminProductMutation,
  useFeatureAdminProductMutation,
  useGetAdminProductByIdQuery,
  useGetAdminProductsQuery,
  useRejectAdminProductMutation,
  useUnfeatureAdminProductMutation,
} from './adminProductsApi'
import type { AdminProductFilters } from './admin-product.types'

export function useAdminProducts(filters?: AdminProductFilters) {
  const isAdmin = useIsAdmin()
  return useGetAdminProductsQuery(filters, { skip: !isAdmin })
}

export function useAdminProduct(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminProductByIdQuery(id ?? '', { skip: !isAdmin || !id })
}

export function useApproveProduct() {
  const [approve, state] = useApproveAdminProductMutation()

  const action = async (id: string) => {
    try {
      const result = await approve(id).unwrap()
      toast.success('Product approved')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to approve product.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useRejectProduct() {
  const [reject, state] = useRejectAdminProductMutation()

  const action = async (id: string, reason?: string) => {
    try {
      const result = await reject({ id, reason }).unwrap()
      toast.success('Product rejected')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject product.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useFeatureProduct() {
  const [feature, state] = useFeatureAdminProductMutation()

  const action = async (id: string) => {
    try {
      const result = await feature(id).unwrap()
      toast.success('Product featured')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to feature product.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useUnfeatureProduct() {
  const [unfeature, state] = useUnfeatureAdminProductMutation()

  const action = async (id: string) => {
    try {
      const result = await unfeature(id).unwrap()
      toast.success('Product unfeatured')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to unfeature product.'))
      throw error
    }
  }

  return [action, state] as const
}
