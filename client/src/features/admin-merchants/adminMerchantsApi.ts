import { baseApi } from '@/services/api'
import type { MerchantProduct } from '@/features/merchant-products/merchant-product.types'

import type {
  MerchantFilters,
  MerchantUser,
  PaginatedMerchants,
} from './admin-merchant.types'

export const adminMerchantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminMerchants: builder.query<PaginatedMerchants, MerchantFilters | void>({
      query: (filters) => ({
        url: '/admin/merchants',
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Merchant' as const, id: _id })),
              { type: 'Merchant', id: 'LIST' },
            ]
          : [{ type: 'Merchant', id: 'LIST' }],
    }),
    getAdminMerchantById: builder.query<MerchantUser, string>({
      query: (id) => `/admin/merchants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Merchant', id }],
    }),
    getAdminMerchantProducts: builder.query<MerchantProduct[], string>({
      query: (id) => `/admin/merchants/${id}/products`,
      providesTags: (_result, _error, id) => [
        { type: 'Merchant', id },
        { type: 'Product', id: `MERCHANT_${id}` },
      ],
    }),
    activateMerchant: builder.mutation<MerchantUser, string>({
      query: (id) => ({
        url: `/admin/merchants/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Merchant', id },
        { type: 'Merchant', id: 'LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    blockMerchant: builder.mutation<MerchantUser, string>({
      query: (id) => ({
        url: `/admin/merchants/${id}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Merchant', id },
        { type: 'Merchant', id: 'LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    rejectMerchant: builder.mutation<
      MerchantUser,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/merchants/${id}/reject`,
        method: 'PATCH',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Merchant', id },
        { type: 'Merchant', id: 'LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
  }),
})

export const {
  useGetAdminMerchantsQuery,
  useGetAdminMerchantByIdQuery,
  useGetAdminMerchantProductsQuery,
  useActivateMerchantMutation,
  useBlockMerchantMutation,
  useRejectMerchantMutation,
} = adminMerchantsApi
