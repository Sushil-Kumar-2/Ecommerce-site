import { baseApi } from '@/services/api'

import type { AuditLog, AuditLogFilters, PaginatedAuditLogs } from './admin-audit-log.types'

export const adminAuditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedAuditLogs, AuditLogFilters | void>({
      query: (filters) => ({
        url: '/audit-logs',
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'AuditLog' as const, id: _id })),
              { type: 'AuditLog', id: 'LIST' },
            ]
          : [{ type: 'AuditLog', id: 'LIST' }],
    }),
    getAuditLogById: builder.query<AuditLog, string>({
      query: (id) => `/audit-logs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AuditLog', id }],
    }),
  }),
})

export const { useGetAuditLogsQuery, useGetAuditLogByIdQuery } = adminAuditLogsApi
