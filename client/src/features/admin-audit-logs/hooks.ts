import { useIsAdmin } from '@/features/admin/hooks'

import { useGetAuditLogByIdQuery, useGetAuditLogsQuery } from './adminAuditLogsApi'
import type { AuditLogFilters } from './admin-audit-log.types'

export function useAdminAuditLogs(filters?: AuditLogFilters) {
  const isAdmin = useIsAdmin()
  return useGetAuditLogsQuery(filters, { skip: !isAdmin })
}

export function useAdminAuditLog(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAuditLogByIdQuery(id ?? '', { skip: !isAdmin || !id })
}
