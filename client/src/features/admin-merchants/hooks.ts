import { toast } from 'sonner'

import { useIsAdmin } from '@/features/admin/hooks'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useActivateMerchantMutation,
  useBlockMerchantMutation,
  useGetAdminMerchantByIdQuery,
  useGetAdminMerchantProductsQuery,
  useGetAdminMerchantsQuery,
  useRejectMerchantMutation,
} from './adminMerchantsApi'
import type { MerchantFilters } from './admin-merchant.types'

export function useAdminMerchants(filters?: MerchantFilters) {
  const isAdmin = useIsAdmin()
  return useGetAdminMerchantsQuery(filters, { skip: !isAdmin })
}

export function useAdminMerchantDetail(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminMerchantByIdQuery(id ?? '', { skip: !isAdmin || !id })
}

export function useAdminMerchantProducts(merchantId: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminMerchantProductsQuery(merchantId ?? '', {
    skip: !isAdmin || !merchantId,
  })
}

export function useActivateMerchant() {
  const [activate, state] = useActivateMerchantMutation()

  const action = async (id: string) => {
    try {
      const result = await activate(id).unwrap()
      toast.success('Merchant activated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to activate merchant.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useBlockMerchant() {
  const [block, state] = useBlockMerchantMutation()

  const action = async (id: string) => {
    try {
      const result = await block(id).unwrap()
      toast.success('Merchant blocked')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to block merchant.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useRejectMerchant() {
  const [reject, state] = useRejectMerchantMutation()

  const action = async (id: string, reason?: string) => {
    try {
      const result = await reject({ id, reason }).unwrap()
      toast.success('Merchant application rejected')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject merchant.'))
      throw error
    }
  }

  return [action, state] as const
}
