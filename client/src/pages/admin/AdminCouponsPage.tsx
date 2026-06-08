import { Plus } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { StringTablePagination } from '@/components/common/TablePagination'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CouponForm,
  useAdminCoupons,
  useAdminCouponStats,
  useCreateCoupon,
  useUpdateCoupon,
  type AdminCoupon,
  type CouponFormValues,
} from '@/features/admin-coupons'
import { DiscountType } from '@/features/admin-coupons/admin-coupon.types'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function formatDiscount(coupon: AdminCoupon): string {
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    return `${coupon.discountValue}%`
  }
  return formatPrice(coupon.discountValue)
}

function CouponStatsPanel({ couponId }: { couponId: string }) {
  const { data: stats, isLoading } = useAdminCouponStats(couponId)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading stats...</p>
  if (!stats) return null

  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
      <p>
        <span className="text-muted-foreground">Total uses:</span> {stats.usageCount}
      </p>
      <p>
        <span className="text-muted-foreground">Unique users:</span> {stats.usedByCount}
      </p>
      <p>
        <span className="text-muted-foreground">Usage limit:</span>{' '}
        {stats.usageLimit ?? 'Unlimited'}
      </p>
    </div>
  )
}

export function AdminCouponsPage() {
  const [page, setPage] = useState('1')
  const { data, error, isLoading, refetch } = useAdminCoupons({ page, limit: '20' })
  const [createCoupon, { isLoading: isCreating }] = useCreateCoupon()
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCoupon()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
  const [couponToDisable, setCouponToDisable] = useState<AdminCoupon | null>(null)

  const openCreate = () => {
    setEditingCoupon(null)
    setDialogOpen(true)
  }

  const openEdit = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCoupon(null)
  }

  const handleSubmit = async (values: CouponFormValues) => {
    const payload = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      expiryDate: new Date(values.expiryDate).toISOString(),
    }

    if (editingCoupon) {
      await updateCoupon(editingCoupon._id, payload)
    } else {
      await createCoupon(payload)
    }
    closeDialog()
  }

  const handleDisable = async () => {
    if (!couponToDisable) return
    await updateCoupon(couponToDisable._id, { isActive: false })
    setCouponToDisable(null)
  }

  const handleEnable = async (coupon: AdminCoupon) => {
    await updateCoupon(coupon._id, { isActive: true })
  }

  if (error) {
    return (
      <PageContainer title="Coupons">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load coupons.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  const coupons = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <PageContainer title="Coupons" description="Create and manage discount coupons.">
      <div className="mb-6 flex justify-end">
        <Button onClick={openCreate}>
          <Plus />
          Add coupon
        </Button>
      </div>

      <DataTable<AdminCoupon>
        columns={[
          { key: 'code', header: 'Code', cell: (row) => row.code },
          { key: 'name', header: 'Name', cell: (row) => row.name },
          {
            key: 'discount',
            header: 'Discount',
            cell: (row) => formatDiscount(row),
          },
          {
            key: 'usage',
            header: 'Usage',
            cell: (row) =>
              row.usageLimit
                ? `${row.usageCount} / ${row.usageLimit}`
                : `${row.usageCount}`,
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.isActive ? 'secondary' : 'outline'}>
                {row.isActive ? 'Active' : 'Disabled'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                {row.isActive ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCouponToDisable(row)}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => void handleEnable(row)}>
                    Enable
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={coupons}
        isLoading={isLoading}
        emptyTitle="No coupons"
        emptyDescription="Create a coupon to offer discounts to customers."
        getRowKey={(row) => row._id}
      />

      <StringTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit coupon' : 'Create coupon'}</DialogTitle>
          </DialogHeader>
          {editingCoupon ? (
            <div className="mb-4">
              <CouponStatsPanel couponId={editingCoupon._id} />
            </div>
          ) : null}
          <CouponForm
            isEdit={Boolean(editingCoupon)}
            defaultValues={
              editingCoupon
                ? {
                    code: editingCoupon.code,
                    name: editingCoupon.name,
                    description: editingCoupon.description ?? '',
                    discountType: editingCoupon.discountType,
                    discountValue: editingCoupon.discountValue,
                    minimumOrderAmount: editingCoupon.minimumOrderAmount,
                    maximumDiscountAmount: editingCoupon.maximumDiscountAmount ?? '',
                    startDate: toDatetimeLocalValue(editingCoupon.startDate),
                    expiryDate: toDatetimeLocalValue(editingCoupon.expiryDate),
                    isActive: editingCoupon.isActive,
                    usageLimit: editingCoupon.usageLimit ?? '',
                  }
                : undefined
            }
            submitLabel={editingCoupon ? 'Update coupon' : 'Create coupon'}
            isLoading={isCreating || isUpdating}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={couponToDisable != null}
        onOpenChange={(open) => {
          if (!open) setCouponToDisable(null)
        }}
        title="Disable coupon"
        description={`Disable coupon "${couponToDisable?.code}"? Customers will no longer be able to use it.`}
        confirmLabel="Disable"
        variant="destructive"
        isLoading={isUpdating}
        onConfirm={handleDisable}
      />
    </PageContainer>
  )
}
