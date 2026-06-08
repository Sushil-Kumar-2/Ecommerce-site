import { baseApi } from '@/services/api'

import type {
  PaginatedProductReports,
  ProductReport,
  ProductReportFilters,
} from './admin-report.types'

export const adminReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProductReports: builder.query<
      PaginatedProductReports,
      ProductReportFilters | void
    >({
      query: (filters) => ({
        url: '/admin/product-reports',
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'ProductReport' as const,
                id: _id,
              })),
              { type: 'ProductReport', id: 'LIST' },
            ]
          : [{ type: 'ProductReport', id: 'LIST' }],
    }),
    getAdminProductReportById: builder.query<ProductReport, string>({
      query: (id) => `/admin/product-reports/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ProductReport', id }],
    }),
    reviewProductReport: builder.mutation<ProductReport, string>({
      query: (id) => ({
        url: `/admin/product-reports/${id}/review`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ProductReport', id },
        { type: 'ProductReport', id: 'LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    resolveProductReport: builder.mutation<ProductReport, string>({
      query: (id) => ({
        url: `/admin/product-reports/${id}/resolve`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ProductReport', id },
        { type: 'ProductReport', id: 'LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
  }),
})

export const {
  useGetAdminProductReportsQuery,
  useGetAdminProductReportByIdQuery,
  useReviewProductReportMutation,
  useResolveProductReportMutation,
} = adminReportsApi
