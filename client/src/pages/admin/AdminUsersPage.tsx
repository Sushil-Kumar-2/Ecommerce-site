import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { StringTablePagination } from '@/components/common/TablePagination'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useAdminUsers,
  useDeactivateUser,
  type AdminUser,
} from '@/features/admin-users'
import { getApiErrorMessage } from '@/utils/api-error'
import { humanizeStatus } from '@/utils/format-label'
import { ROUTES } from '@/utils/routes'

const ROLE_FILTERS = [
  { label: 'All roles', value: '' },
  { label: 'Users', value: 'user' },
  { label: 'Merchants', value: 'merchant' },
  { label: 'Admins', value: 'admin' },
] as const

const STATUS_FILTERS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Pending', value: 'pending' },
] as const

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<'user' | 'merchant' | 'admin' | ''>(
    '',
  )
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'blocked' | 'pending' | ''
  >('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState('1')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage('1')
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, error, isLoading, refetch } = useAdminUsers({
    role: roleFilter === '' ? undefined : roleFilter,
    status: statusFilter === '' ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit: '20',
  })
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUser()
  const [userToDeactivate, setUserToDeactivate] = useState<AdminUser | null>(null)

  if (error) {
    return (
      <PageContainer title="Users">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load users.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  const users = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <PageContainer title="Users" description="Manage platform user accounts.">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {ROLE_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={roleFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setRoleFilter(filter.value)
              setPage('1')
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(filter.value)
              setPage('1')
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <DataTable<AdminUser>
        columns={[
          {
            key: 'name',
            header: 'User',
            cell: (row) => (
              <Link
                to={ROUTES.adminUserDetail(row._id)}
                className="font-medium hover:underline"
              >
                {row.name}
              </Link>
            ),
          },
          { key: 'email', header: 'Email', cell: (row) => row.email },
          {
            key: 'role',
            header: 'Role',
            cell: (row) => <Badge variant="outline">{row.role}</Badge>,
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="secondary">{humanizeStatus(row.status)}</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.adminUserDetail(row._id)}>View</Link>
                </Button>
                {row.status === 'active' && row.role !== 'admin' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeactivating}
                    onClick={() => setUserToDeactivate(row)}
                  >
                    Deactivate
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        data={users}
        isLoading={isLoading}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters."
        getRowKey={(row) => row._id}
      />

      <StringTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={userToDeactivate != null}
        onOpenChange={(open) => {
          if (!open) setUserToDeactivate(null)
        }}
        title="Deactivate user"
        description={`Are you sure you want to deactivate "${userToDeactivate?.name}"? They will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        variant="destructive"
        isLoading={isDeactivating}
        onConfirm={async () => {
          if (!userToDeactivate) return
          await deactivateUser(userToDeactivate._id)
          setUserToDeactivate(null)
        }}
      />
    </PageContainer>
  )
}
