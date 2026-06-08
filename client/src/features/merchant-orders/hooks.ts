import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { UserRole } from '@/types/auth.types'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useAcceptMerchantOrderMutation,
  useGetMerchantOrderByIdQuery,
  useGetMerchantOrdersQuery,
  useGetMerchantOrderSummaryQuery,
  useReadyToShipMerchantOrderMutation,
  useRejectMerchantOrderMutation,
  useShipMerchantOrderMutation,
} from './merchantOrdersApi'
import type { MerchantOrderFilters } from './merchant-order.types'

function useIsMerchant() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.role === UserRole.MERCHANT
}

export function useMerchantOrders(filters?: MerchantOrderFilters) {
  const isMerchant = useIsMerchant()
  return useGetMerchantOrdersQuery(filters, { skip: !isMerchant })
}

export function useMerchantOrderDetail(orderId: string | undefined) {
  const isMerchant = useIsMerchant()
  return useGetMerchantOrderByIdQuery(orderId ?? '', {
    skip: !isMerchant || !orderId,
  })
}

export function useMerchantOrderSummary() {
  const isMerchant = useIsMerchant()
  return useGetMerchantOrderSummaryQuery(undefined, { skip: !isMerchant })
}

export function useAcceptMerchantOrder() {
  const [accept, state] = useAcceptMerchantOrderMutation()
  const action = async (orderId: string) => {
    try {
      const result = await accept(orderId).unwrap()
      toast.success('Order accepted')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept order.'))
      throw error
    }
  }
  return [action, state] as const
}

export function useReadyToShipMerchantOrder() {
  const [ready, state] = useReadyToShipMerchantOrderMutation()
  const action = async (orderId: string) => {
    try {
      const result = await ready(orderId).unwrap()
      toast.success('Order marked ready to ship')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update order.'))
      throw error
    }
  }
  return [action, state] as const
}

export function useShipMerchantOrder() {
  const [ship, state] = useShipMerchantOrderMutation()
  const action = async (
    orderId: string,
    trackingNumber: string,
    carrier?: string,
  ) => {
    try {
      const result = await ship({ orderId, trackingNumber, carrier }).unwrap()
      toast.success('Order shipped')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to ship order.'))
      throw error
    }
  }
  return [action, state] as const
}

export function useRejectMerchantOrder() {
  const [reject, state] = useRejectMerchantOrderMutation()
  const action = async (orderId: string, reason: string) => {
    try {
      const result = await reject({ orderId, reason }).unwrap()
      toast.success('Order rejected')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject order.'))
      throw error
    }
  }
  return [action, state] as const
}
