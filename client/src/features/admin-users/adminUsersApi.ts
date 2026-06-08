import { baseApi } from '@/services/api'

import type {
  AdminUser,
  AdminUserFilters,
  AdminUserOrders,
  PaginatedAdminUsers,
} from './admin-user.types'

export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<PaginatedAdminUsers, AdminUserFilters | void>({
      query: (filters) => ({
        url: '/admin/users',
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'User', id: 'ADMIN_LIST' }],
    }),
    getAdminUserById: builder.query<AdminUser, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    getAdminUserOrders: builder.query<AdminUserOrders, string>({
      query: (id) => `/admin/users/${id}/orders`,
      providesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'Order', id: `USER_${id}` },
      ],
    }),
    deactivateAdminUser: builder.mutation<AdminUser, string>({
      query: (id) => ({
        url: `/admin/users/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'ADMIN_LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    activateAdminUser: builder.mutation<AdminUser, string>({
      query: (id) => ({
        url: `/admin/users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'ADMIN_LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
  }),
})

export const {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useGetAdminUserOrdersQuery,
  useDeactivateAdminUserMutation,
  useActivateAdminUserMutation,
} = adminUsersApi
