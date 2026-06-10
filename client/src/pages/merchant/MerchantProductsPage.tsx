import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { FilterBar } from '@/components/design-system'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useDeleteProduct,
  useMyProducts,
  useSubmitProduct,
  type MerchantProduct,
} from '@/features/merchant-products'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { humanizeStatus } from '@/utils/format-label'
import { ROUTES } from '@/utils/routes'

export function MerchantProductsPage() {
  const { data: products = [], error, isLoading, refetch } = useMyProducts()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProduct()
  const [submitProduct, { isLoading: isSubmitting }] = useSubmitProduct()

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = search
        ? product.title.toLowerCase().includes(search.toLowerCase())
        : true
      const matchesStatus =
        statusFilter === 'all' ? true : product.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])
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
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
        filters={[
          { value: 'all', label: 'All' },
          { value: 'approved', label: 'Approved' },
          { value: 'pending', label: 'Pending' },
          { value: 'draft', label: 'Draft' },
          { value: 'rejected', label: 'Rejected' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        actions={
          <Button asChild>
            <Link to={ROUTES.merchantProductNew}>
              <Plus />
              Add product
            </Link>
          </Button>
        }
        className="mb-6"
      />

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
              <div className="flex flex-wrap gap-2">
                {row.status !== 'pending' ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={ROUTES.merchantProductEdit(row._id)}>Edit</Link>
                  </Button>
                ) : null}
                {row.status === 'draft' || row.status === 'rejected' ? (
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => void submitProduct(row._id)}
                  >
                    Submit for review
                  </Button>
                ) : null}
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
        data={filteredProducts}
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
