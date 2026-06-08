import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useDeleteProduct,
  useMyProducts,
  type MerchantProduct,
} from '@/features/merchant-products'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { humanizeStatus } from '@/utils/format-label'
import { ROUTES } from '@/utils/routes'

export function MerchantProductsPage() {
  const { data: products = [], error, isLoading, refetch } = useMyProducts()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProduct()
  const [productToDelete, setProductToDelete] = useState<MerchantProduct | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!productToDelete) return

    setDeletingId(productToDelete._id)
    try {
      await deleteProduct(productToDelete._id)
      setProductToDelete(null)
    } finally {
      setDeletingId(null)
    }
  }

  if (error) {
    return (
      <PageContainer title="Products">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load products.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Products" description="Manage your product catalog.">
      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link to={ROUTES.merchantProductNew}>
            <Plus />
            Add product
          </Link>
        </Button>
      </div>

      <DataTable<MerchantProduct>
        columns={[
          { key: 'title', header: 'Title', cell: (row) => row.title },
          {
            key: 'price',
            header: 'Price',
            cell: (row) => formatPrice(row.discountPrice || row.price),
          },
          { key: 'stock', header: 'Stock', cell: (row) => row.stock },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{humanizeStatus(row.status)}</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.merchantProductEdit(row._id)}>Edit</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting && deletingId === row._id}
                  onClick={() => setProductToDelete(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products yet"
        emptyDescription="Create your first product to start selling."
        getRowKey={(row) => row._id}
      />

      <ConfirmDialog
        open={productToDelete != null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null)
        }}
        title="Delete product"
        description={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </PageContainer>
  )
}
