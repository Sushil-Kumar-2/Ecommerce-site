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
  useActivateMerchant,
  useAdminMerchants,
  useBlockMerchant,
  type MerchantUser,
} from '@/features/admin-merchants'
import { getApiErrorMessage } from '@/utils/api-error'
import { humanizeStatus } from '@/utils/format-label'
import { ROUTES } from '@/utils/routes'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Pending', value: 'pending' },
] as const

export function AdminMerchantsPage() {
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

  const { data, error, isLoading, refetch } = useAdminMerchants({
    status: statusFilter === '' ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit: '20',
  })
  const [activateMerchant, { isLoading: isActivating }] = useActivateMerchant()
  const [blockMerchant, { isLoading: isBlocking }] = useBlockMerchant()
  const [merchantToBlock, setMerchantToBlock] = useState<MerchantUser | null>(null)

  if (error) {
    return (
      <PageContainer title="Merchants">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load merchants.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  const merchants = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <PageContainer
      title="Merchants"
      description="Review and manage merchant accounts."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or shop..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pl-8"
          />
        </div>
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

      <DataTable<MerchantUser>
        columns={[
          {
            key: 'name',
            header: 'Merchant',
            cell: (row) => (
              <Link
                to={ROUTES.adminMerchantDetail(row._id)}
                className="font-medium hover:underline"
              >
                {row.shopName || row.name}
              </Link>
            ),
          },
          { key: 'email', header: 'Email', cell: (row) => row.email },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{humanizeStatus(row.status)}</Badge>,
          },
          {
            key: 'verified',
            header: 'Verified',
            cell: (row) => (row.emailVerified ? 'Yes' : 'No'),
          },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.adminMerchantDetail(row._id)}>View</Link>
                </Button>
                {row.status !== 'active' ? (
                  <Button
                    size="sm"
                    disabled={isActivating}
                    onClick={() => void activateMerchant(row._id)}
                  >
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isBlocking}
                    onClick={() => setMerchantToBlock(row)}
                  >
                    Block
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={merchants}
        isLoading={isLoading}
        emptyTitle="No merchants found"
        emptyDescription="Try adjusting your search or filters."
        getRowKey={(row) => row._id}
      />

      <StringTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={merchantToBlock != null}
        onOpenChange={(open) => {
          if (!open) setMerchantToBlock(null)
        }}
        title="Block merchant"
        description={`Are you sure you want to block "${merchantToBlock?.shopName || merchantToBlock?.name}"? They will lose access to the merchant dashboard.`}
        confirmLabel="Block"
        variant="destructive"
        isLoading={isBlocking}
        onConfirm={async () => {
          if (!merchantToBlock) return
          await blockMerchant(merchantToBlock._id)
          setMerchantToBlock(null)
        }}
      />
    </PageContainer>
  )
}
