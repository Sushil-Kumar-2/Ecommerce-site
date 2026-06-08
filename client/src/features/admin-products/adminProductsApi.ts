import { baseApi } from '@/services/api'

import type {
  AdminProduct,
  AdminProductFilters,
  PaginatedAdminProducts,
  RejectProductRequest,
} from './admin-product.types'

export const adminProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query<PaginatedAdminProducts, AdminProductFilters | void>({
      query: (filters) => ({
        url: '/admin/products',
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),
    getAdminProductById: builder.query<AdminProduct, string>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    approveAdminProduct: builder.mutation<AdminProduct, string>({
      query: (id) => ({
        url: `/admin/products/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    rejectAdminProduct: builder.mutation<AdminProduct, RejectProductRequest>({
      query: ({ id, reason }) => ({
        url: `/admin/products/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    featureAdminProduct: builder.mutation<AdminProduct, string>({
      query: (id) => ({
        url: `/admin/products/${id}/feature`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    unfeatureAdminProduct: builder.mutation<AdminProduct, string>({
      query: (id) => ({
        url: `/admin/products/${id}/unfeature`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
  }),
})

export const {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useApproveAdminProductMutation,
  useRejectAdminProductMutation,
  useFeatureAdminProductMutation,
  useUnfeatureAdminProductMutation,
} = adminProductsApi
