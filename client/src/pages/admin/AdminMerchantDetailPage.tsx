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
  useActivateMerchant,
  useAdminMerchantDetail,
  useAdminMerchantProducts,
  useBlockMerchant,
} from '@/features/admin-merchants'
import type { MerchantProduct } from '@/features/merchant-products'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function AdminMerchantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: merchant, error, isLoading, refetch } = useAdminMerchantDetail(id)
  const { data: products = [], isLoading: isProductsLoading } =
    useAdminMerchantProducts(id)
  const [activateMerchant, { isLoading: isActivating }] = useActivateMerchant()
  const [blockMerchant, { isLoading: isBlocking }] = useBlockMerchant()
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  if (error || (!isLoading && !merchant)) {
    return (
      <PageContainer title="Merchant detail">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.adminMerchants}>
            <ArrowLeft className="size-4" />
            Back to merchants
          </Link>
        </Button>
        <ErrorState
          message={getApiErrorMessage(error, 'Merchant not found.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  if (!merchant) {
    return (
      <PageContainer title="Merchant detail">
        <Skeleton className="mb-6 h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </PageContainer>
    )
  }

  return (
    <PageContainer title={merchant.shopName || merchant.name}>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.adminMerchants}>
          <ArrowLeft className="size-4" />
          Back to merchants
        </Link>
      </Button>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{merchant.status}</Badge>
              {merchant.emailVerified ? (
                <Badge variant="secondary">Email verified</Badge>
              ) : null}
            </div>
            <p>
              <span className="text-muted-foreground">Name:</span> {merchant.name}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {merchant.email}
            </p>
            {merchant.phone ? (
              <p>
                <span className="text-muted-foreground">Phone:</span> {merchant.phone}
              </p>
            ) : null}
            {merchant.shopDescription ? (
              <p>
                <span className="text-muted-foreground">Description:</span>{' '}
                {merchant.shopDescription}
              </p>
            ) : null}
            {merchant.gstNumber ? (
              <p>
                <span className="text-muted-foreground">GST:</span> {merchant.gstNumber}
              </p>
            ) : null}
            {merchant.businessAddress ? (
              <p>
                <span className="text-muted-foreground">Address:</span>{' '}
                {merchant.businessAddress}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-3">
          {merchant.status !== 'active' ? (
            <Button
              className="w-full"
              disabled={isActivating}
              onClick={() => id && void activateMerchant(id)}
            >
              Activate merchant
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              disabled={isBlocking}
              onClick={() => setShowBlockConfirm(true)}
            >
              Block merchant
            </Button>
          )}
        </aside>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Products</h2>
      <DataTable<MerchantProduct>
        columns={[
          {
            key: 'title',
            header: 'Title',
            cell: (row) => (
              <Link
                to={ROUTES.adminProductDetail(row._id)}
                className="hover:underline"
              >
                {row.title}
              </Link>
            ),
          },
          {
            key: 'price',
            header: 'Price',
            cell: (row) => formatPrice(row.discountPrice || row.price),
          },
          { key: 'stock', header: 'Stock', cell: (row) => row.stock },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{row.status}</Badge>,
          },
        ]}
        data={products}
        isLoading={isProductsLoading}
        emptyTitle="No products"
        emptyDescription="This merchant has not listed any products yet."
        getRowKey={(row) => row._id}
      />

      <ConfirmDialog
        open={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        title="Block merchant"
        description={`Are you sure you want to block "${merchant.shopName || merchant.name}"?`}
        confirmLabel="Block"
        variant="destructive"
        isLoading={isBlocking}
        onConfirm={async () => {
          if (!id) return
          await blockMerchant(id)
          setShowBlockConfirm(false)
        }}
      />
    </PageContainer>
  )
}
