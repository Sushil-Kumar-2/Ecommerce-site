import { Link } from 'react-router-dom'
import { useState } from 'react'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useAdminProducts,
  type AdminProduct,
  type AdminProductFilters,
} from '@/features/admin-products'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

type ProductTab = 'all' | 'pending' | 'approved' | 'rejected' | 'featured'

const STATUS_TABS: { label: string; value: ProductTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Featured', value: 'featured' },
]

function getFilters(tab: ProductTab, page: string): AdminProductFilters {
  if (tab === 'all') return { page, limit: '20' }
  if (tab === 'featured') return { page, limit: '20', featured: true }
  return { page, limit: '20', status: tab }
}

function getMerchantName(product: AdminProduct): string {
  if (typeof product.merchantId === 'object') {
    return product.merchantId.shopName || product.merchantId.name
  }
  return '—'
}

export function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>('all')
  const [page, setPage] = useState('1')

  const { data, error, isLoading, refetch } = useAdminProducts(
    getFilters(activeTab, page),
  )

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

  const products = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <PageContainer
      title="Products"
      description="Review, approve, and feature marketplace products."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab(tab.value)
              setPage('1')
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <DataTable<AdminProduct>
        columns={[
          {
            key: 'title',
            header: 'Product',
            cell: (row) => (
              <Link
                to={ROUTES.adminProductDetail(row._id)}
                className="font-medium hover:underline"
              >
                {row.title}
              </Link>
            ),
          },
          {
            key: 'merchant',
            header: 'Merchant',
            cell: (row) => getMerchantName(row),
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
            cell: (row) => (
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">{row.status}</Badge>
                {row.featured ? <Badge variant="secondary">Featured</Badge> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.adminProductDetail(row._id)}>Review</Link>
              </Button>
            ),
          },
        ]}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products found"
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
