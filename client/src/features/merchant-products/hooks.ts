import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { UserRole } from '@/types/auth.types'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetMerchantCategoriesQuery,
  useGetMerchantProductByIdQuery,
  useGetMyProductsQuery,
  useUpdateProductMutation,
} from './merchantProductsApi'
import type {
  CreateMerchantProductRequest,
  UpdateMerchantProductRequest,
} from './merchant-product.types'

function useIsMerchant() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.role === UserRole.MERCHANT
}

export function useMyProducts() {
  const isMerchant = useIsMerchant()
  return useGetMyProductsQuery(undefined, { skip: !isMerchant })
}

export function useMerchantProduct(id: string | undefined) {
  const isMerchant = useIsMerchant()
  return useGetMerchantProductByIdQuery(id ?? '', {
    skip: !isMerchant || !id,
  })
}

export function useMerchantCategories() {
  return useGetMerchantCategoriesQuery()
}

export function useCreateProduct() {
  const [createProduct, state] = useCreateProductMutation()

  const create = async (payload: CreateMerchantProductRequest) => {
    try {
      const result = await createProduct(payload).unwrap()
      toast.success('Product created')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create product.'))
      throw error
    }
  }

  return [create, state] as const
}

export function useUpdateProduct() {
  const [updateProduct, state] = useUpdateProductMutation()

  const update = async (id: string, data: UpdateMerchantProductRequest) => {
    try {
      const result = await updateProduct({ id, data }).unwrap()
      toast.success('Product updated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update product.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useDeleteProduct() {
  const [deleteProduct, state] = useDeleteProductMutation()

  const remove = async (id: string) => {
    try {
      await deleteProduct(id).unwrap()
      toast.success('Product deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete product.'))
      throw error
    }
  }

  return [remove, state] as const
}

export function useUpdateStock() {
  const [update, state] = useUpdateProduct()

  const updateStock = async (id: string, stock: number) => {
    return update(id, { stock })
  }

  return [updateStock, state] as const
}
