import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useCancelOrderMutation,
  useCreateReturnMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
} from './ordersApi'
import type { CreateReturnRequest } from './order.types'

export function useMyOrders() {
  const { isAuthenticated } = useAuth()

  return useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  })
}

export function useOrderDetail(orderId: string | undefined) {
  const { isAuthenticated } = useAuth()

  return useGetOrderByIdQuery(orderId ?? '', {
    skip: !isAuthenticated || !orderId,
  })
}

export function useCancelOrder() {
  const [cancelOrder, state] = useCancelOrderMutation()

  const cancel = async (orderId: string, reason: string) => {
    try {
      const result = await cancelOrder({ orderId, reason }).unwrap()
      toast.success('Order cancelled')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to cancel order.'))
      throw error
    }
  }

  return [cancel, state] as const
}

export function useCreateReturn() {
  const [createReturn, state] = useCreateReturnMutation()

  const requestReturn = async (payload: CreateReturnRequest) => {
    try {
      const result = await createReturn(payload).unwrap()
      toast.success('Return request submitted')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit return request.'))
      throw error
    }
  }

  return [requestReturn, state] as const
}
