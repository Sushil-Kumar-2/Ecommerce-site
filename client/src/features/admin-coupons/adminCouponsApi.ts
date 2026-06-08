import { baseApi } from '@/services/api'

import type {
  AdminCoupon,
  CouponFilters,
  CouponStats,
  CreateCouponRequest,
  PaginatedCoupons,
  UpdateCouponRequest,
} from './admin-coupon.types'

export const adminCouponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCoupons: builder.query<PaginatedCoupons, CouponFilters | void>({
      query: (filters) => ({
        url: '/coupons',
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Coupon' as const, id: _id })),
              { type: 'Coupon', id: 'LIST' },
            ]
          : [{ type: 'Coupon', id: 'LIST' }],
    }),
    getAdminCouponById: builder.query<AdminCoupon, string>({
      query: (id) => `/coupons/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Coupon', id }],
    }),
    getAdminCouponStats: builder.query<CouponStats, string>({
      query: (id) => `/coupons/${id}/stats`,
      providesTags: (_result, _error, id) => [{ type: 'Coupon', id: `${id}_STATS` }],
    }),
    createCoupon: builder.mutation<AdminCoupon, CreateCouponRequest>({
      query: (body) => ({
        url: '/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Coupon', id: 'LIST' }, 'Dashboard', 'AuditLog'],
    }),
    updateCoupon: builder.mutation<AdminCoupon, { id: string; data: UpdateCouponRequest }>({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Coupon', id },
        { type: 'Coupon', id: 'LIST' },
        { type: 'Coupon', id: `${id}_STATS` },
        'Dashboard',
      ],
    }),
    deleteCoupon: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Coupon', id },
        { type: 'Coupon', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
})

export const {
  useGetAdminCouponsQuery,
  useGetAdminCouponByIdQuery,
  useGetAdminCouponStatsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = adminCouponsApi
