import { Link } from 'react-router-dom'
import { useState } from 'react'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { FilterBar } from '@/components/design-system'
import { StringTablePagination } from '@/components/common/TablePagination'
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

function getFilters(tab: ProductTab, page: string, search: string): AdminProductFilters {
  const base: AdminProductFilters = { page, limit: '20' }
  if (search.trim()) base.search = search.trim()
  if (tab === 'all') return base
  if (tab === 'featured') return { ...base, featured: true }
  return { ...base, status: tab }
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
  const [search, setSearch] = useState('')

  const { data, error, isLoading, refetch } = useAdminProducts(
    getFilters(activeTab, page, search),
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
      <FilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage('1')
        }}
        searchPlaceholder="Search products..."
        className="mb-4"
      />

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

      <StringTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </PageContainer>
  )
}
