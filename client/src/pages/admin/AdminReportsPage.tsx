import { Link } from 'react-router-dom'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { StringTablePagination } from '@/components/common/TablePagination'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ProductReportStatus,
  useAdminProductReports,
  useResolveProductReport,
  useReviewProductReport,
  type ProductReport,
} from '@/features/admin-reports'
import { formatOrderDate } from '@/features/orders'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: ProductReportStatus.PENDING },
  { label: 'Reviewed', value: ProductReportStatus.REVIEWED },
  { label: 'Resolved', value: ProductReportStatus.RESOLVED },
] as const

export function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ProductReportStatus | ''>('')
  const [page, setPage] = useState('1')

  const { data, error, isLoading, refetch } = useAdminProductReports({
    status: statusFilter === '' ? undefined : statusFilter,
    page,
    limit: '20',
  })
  const [reviewReport, { isLoading: isReviewing }] = useReviewProductReport()
  const [resolveReport, { isLoading: isResolving }] = useResolveProductReport()
  const [reportToResolve, setReportToResolve] = useState<ProductReport | null>(null)

  if (error) {
    return (
      <PageContainer title="Product reports">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load reports.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  const reports = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <PageContainer
      title="Product reports"
      description="Review and resolve customer-reported products."
    >
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

      <DataTable<ProductReport>
        columns={[
          {
            key: 'product',
            header: 'Product',
            cell: (row) =>
              row.product ? (
                <Link
                  to={ROUTES.adminProductDetail(row.product._id)}
                  className="hover:underline"
                >
                  {row.product.title}
                </Link>
              ) : (
                '—'
              ),
          },
          {
            key: 'reporter',
            header: 'Reporter',
            cell: (row) =>
              row.reporter ? (
                <div>
                  <p className="font-medium">{row.reporter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.reporter.email}
                  </p>
                </div>
              ) : (
                '—'
              ),
          },
          {
            key: 'reason',
            header: 'Reason',
            cell: (row) => (
              <span className="line-clamp-2 max-w-xs">{row.reason}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{row.status}</Badge>,
          },
          {
            key: 'date',
            header: 'Reported',
            cell: (row) => formatOrderDate(row.createdAt),
          },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                {row.status === ProductReportStatus.PENDING ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isReviewing}
                    onClick={() => void reviewReport(row._id)}
                  >
                    Review
                  </Button>
                ) : null}
                {row.status !== ProductReportStatus.RESOLVED ? (
                  <Button
                    size="sm"
                    disabled={isResolving}
                    onClick={() => setReportToResolve(row)}
                  >
                    Resolve
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        data={reports}
        isLoading={isLoading}
        emptyTitle="No reports"
        emptyDescription="No product reports match the current filter."
        getRowKey={(row) => row._id}
      />

      <StringTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={reportToResolve != null}
        onOpenChange={(open) => {
          if (!open) setReportToResolve(null)
        }}
        title="Resolve report"
        description="Mark this product report as resolved?"
        confirmLabel="Resolve"
        isLoading={isResolving}
        onConfirm={async () => {
          if (!reportToResolve) return
          await resolveReport(reportToResolve._id)
          setReportToResolve(null)
        }}
      />
    </PageContainer>
  )
}
