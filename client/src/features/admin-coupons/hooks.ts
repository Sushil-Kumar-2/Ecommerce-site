import { toast } from 'sonner'

import { useIsAdmin } from '@/features/admin/hooks'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetAdminCouponByIdQuery,
  useGetAdminCouponsQuery,
  useGetAdminCouponStatsQuery,
  useUpdateCouponMutation,
} from './adminCouponsApi'
import type { CouponFilters, CreateCouponRequest, UpdateCouponRequest } from './admin-coupon.types'

export function useAdminCoupons(filters?: CouponFilters) {
  const isAdmin = useIsAdmin()
  return useGetAdminCouponsQuery(filters, { skip: !isAdmin })
}

export function useAdminCoupon(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminCouponByIdQuery(id ?? '', { skip: !isAdmin || !id })
}

export function useAdminCouponStats(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminCouponStatsQuery(id ?? '', { skip: !isAdmin || !id })
}

export function useCreateCoupon() {
  const [createCoupon, state] = useCreateCouponMutation()

  const create = async (payload: CreateCouponRequest) => {
    try {
      const result = await createCoupon(payload).unwrap()
      toast.success('Coupon created')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create coupon.'))
      throw error
    }
  }

  return [create, state] as const
}

export function useUpdateCoupon() {
  const [updateCoupon, state] = useUpdateCouponMutation()

  const update = async (id: string, data: UpdateCouponRequest) => {
    try {
      const result = await updateCoupon({ id, data }).unwrap()
      toast.success('Coupon updated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update coupon.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useDeleteCoupon() {
  const [deleteCoupon, state] = useDeleteCouponMutation()

  const remove = async (id: string) => {
    try {
      await deleteCoupon(id).unwrap()
      toast.success('Coupon deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete coupon.'))
      throw error
    }
  }

  return [remove, state] as const
}
