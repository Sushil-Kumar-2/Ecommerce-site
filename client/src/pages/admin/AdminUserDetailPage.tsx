import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useActivateUser,
  useAdminUserDetail,
  useAdminUserOrders,
  useDeactivateUser,
} from '@/features/admin-users'
import { formatOrderDate } from '@/features/orders'
import type { Order } from '@/features/orders/order.types'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user, error, isLoading, refetch } = useAdminUserDetail(id)
  const { data: orders = [], isLoading: isOrdersLoading } = useAdminUserOrders(id)
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUser()
  const [activateUser, { isLoading: isActivating }] = useActivateUser()
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

  if (error || (!isLoading && !user)) {
    return (
      <PageContainer title="User detail">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.adminUsers}>
            <ArrowLeft className="size-4" />
            Back to users
          </Link>
        </Button>
        <ErrorState
          message={getApiErrorMessage(error, 'User not found.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  if (!user) {
    return (
      <PageContainer title="User detail">
        <Skeleton className="mb-6 h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </PageContainer>
    )
  }

  const canDeactivate = user.status === 'active' && user.role !== 'admin'
  const canActivate = user.status !== 'active'

  return (
    <PageContainer title={user.name}>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.adminUsers}>
          <ArrowLeft className="size-4" />
          Back to users
        </Link>
      </Button>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{user.role}</Badge>
              <Badge variant="secondary">{user.status}</Badge>
              {user.emailVerified ? (
                <Badge variant="secondary">Email verified</Badge>
              ) : null}
            </div>
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </p>
            {user.phone ? (
              <p>
                <span className="text-muted-foreground">Phone:</span> {user.phone}
              </p>
            ) : null}
            {user.shopName ? (
              <p>
                <span className="text-muted-foreground">Shop:</span> {user.shopName}
              </p>
            ) : null}
            {user.createdAt ? (
              <p>
                <span className="text-muted-foreground">Joined:</span>{' '}
                {formatOrderDate(user.createdAt)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-3">
          {canDeactivate ? (
            <Button
              variant="destructive"
              className="w-full"
              disabled={isDeactivating}
              onClick={() => setShowDeactivateConfirm(true)}
            >
              Deactivate user
            </Button>
          ) : null}
          {canActivate ? (
            <Button
              className="w-full"
              disabled={isActivating}
              onClick={() => id && void activateUser(id)}
            >
              Activate user
            </Button>
          ) : null}
        </aside>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Order history</h2>
      <DataTable<Order>
        columns={[
          {
            key: 'orderNumber',
            header: 'Order',
            cell: (row) => row.orderNumber,
          },
          {
            key: 'date',
            header: 'Date',
            cell: (row) => formatOrderDate(row.createdAt),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant="outline">
                {row.orderStatus.replace(/_/g, ' ')}
              </Badge>
            ),
          },
          {
            key: 'payment',
            header: 'Payment',
            cell: (row) => row.paymentStatus,
          },
          {
            key: 'total',
            header: 'Total',
            cell: (row) => formatPrice(row.totalAmount),
          },
        ]}
        data={orders}
        isLoading={isOrdersLoading}
        emptyTitle="No orders"
        emptyDescription="This user has not placed any orders yet."
        getRowKey={(row) => row._id}
      />

      <ConfirmDialog
        open={showDeactivateConfirm}
        onOpenChange={setShowDeactivateConfirm}
        title="Deactivate user"
        description={`Are you sure you want to deactivate "${user.name}"?`}
        confirmLabel="Deactivate"
        variant="destructive"
        isLoading={isDeactivating}
        onConfirm={async () => {
          if (!id) return
          await deactivateUser(id)
          setShowDeactivateConfirm(false)
        }}
      />
    </PageContainer>
  )
}
