import { toast } from 'sonner'

import { useIsAdmin } from '@/features/admin/hooks'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useActivateAdminUserMutation,
  useDeactivateAdminUserMutation,
  useGetAdminUserByIdQuery,
  useGetAdminUserOrdersQuery,
  useGetAdminUsersQuery,
} from './adminUsersApi'
import type { AdminUserFilters } from './admin-user.types'

export function useAdminUsers(filters?: AdminUserFilters) {
  const isAdmin = useIsAdmin()
  return useGetAdminUsersQuery(filters, { skip: !isAdmin })
}

export function useAdminUserDetail(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminUserByIdQuery(id ?? '', { skip: !isAdmin || !id })
}

export function useAdminUserOrders(userId: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminUserOrdersQuery(userId ?? '', { skip: !isAdmin || !userId })
}

export function useDeactivateUser() {
  const [deactivate, state] = useDeactivateAdminUserMutation()

  const action = async (id: string) => {
    try {
      const result = await deactivate(id).unwrap()
      toast.success('User deactivated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to deactivate user.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useActivateUser() {
  const [activate, state] = useActivateAdminUserMutation()

  const action = async (id: string) => {
    try {
      const result = await activate(id).unwrap()
      toast.success('User activated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to activate user.'))
      throw error
    }
  }

  return [action, state] as const
}
