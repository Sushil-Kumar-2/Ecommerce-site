import { useState } from 'react'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AuditAction,
  AuditResource,
  useAdminAuditLogs,
  type AuditLog,
  type AuditLogFilters,
} from '@/features/admin-audit-logs'
import { formatOrderDate } from '@/features/orders'
import { getApiErrorMessage } from '@/utils/api-error'

const ACTION_OPTIONS = [
  { label: 'All actions', value: '' },
  ...Object.values(AuditAction).map((action) => ({
    label: action.replace(/_/g, ' '),
    value: action,
  })),
]

const RESOURCE_OPTIONS = [
  { label: 'All resources', value: '' },
  ...Object.values(AuditResource).map((resource) => ({
    label: resource.replace(/_/g, ' '),
    value: resource,
  })),
]

export function AdminAuditLogsPage() {
  const [action, setAction] = useState<AuditLogFilters['action'] | ''>('')
  const [resource, setResource] = useState('')
  const [userId, setUserId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState('1')

  const filters: AuditLogFilters = {
    page,
    limit: '20',
    ...(action ? { action } : {}),
    ...(resource ? { resource } : {}),
    ...(userId.trim() ? { userId: userId.trim() } : {}),
    ...(from ? { from: new Date(from).toISOString() } : {}),
    ...(to ? { to: new Date(to).toISOString() } : {}),
  }

  const { data, error, isLoading, refetch } = useAdminAuditLogs(filters)

  if (error) {
    return (
      <PageContainer title="Audit logs">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load audit logs.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  const logs = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  const applyFilters = () => setPage('1')

  return (
    <PageContainer
      title="Audit logs"
      description="Track administrative and system actions across the platform."
    >
      <div className="mb-6 grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <select
            id="action"
            value={action}
            onChange={(event) => {
              setAction(event.target.value as AuditLogFilters['action'] | '')
              applyFilters()
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resource">Resource</Label>
          <select
            id="resource"
            value={resource}
            onChange={(event) => {
              setResource(event.target.value)
              applyFilters()
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            placeholder="Filter by user ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            onBlur={applyFilters}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="datetime-local"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value)
              applyFilters()
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="datetime-local"
            value={to}
            onChange={(event) => {
              setTo(event.target.value)
              applyFilters()
            }}
          />
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setAction('')
              setResource('')
              setUserId('')
              setFrom('')
              setTo('')
              setPage('1')
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      <DataTable<AuditLog>
        columns={[
          {
            key: 'date',
            header: 'Date',
            cell: (row) => formatOrderDate(row.createdAt),
          },
          {
            key: 'action',
            header: 'Action',
            cell: (row) => (
              <Badge variant="outline">{row.action.replace(/_/g, ' ')}</Badge>
            ),
          },
          {
            key: 'resource',
            header: 'Resource',
            cell: (row) => row.resource,
          },
          {
            key: 'resourceId',
            header: 'Resource ID',
            cell: (row) => (
              <span className="font-mono text-xs">{row.resourceId}</span>
            ),
          },
          {
            key: 'userId',
            header: 'User ID',
            cell: (row) => row.userId ?? '—',
          },
          {
            key: 'role',
            header: 'Role',
            cell: (row) => row.role,
          },
        ]}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No audit logs"
        emptyDescription="No logs match the current filters."
        getRowKey={(row) => row._id}
      />

      {totalPages > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === '1'}
            onClick={() => setPage(String(Number(page) - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={Number(page) >= totalPages}
            onClick={() => setPage(String(Number(page) + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </PageContainer>
  )
}
