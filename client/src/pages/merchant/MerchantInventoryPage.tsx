import { useMemo, useState } from 'react'

import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { TablePagination } from '@/components/common/TablePagination'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetInventoryTransactionsQuery } from '@/features/inventory'
import type { InventoryTransaction, InventoryTransactionType } from '@/features/inventory'
import { useMyProducts } from '@/features/merchant-products'
import { formatOrderDate } from '@/features/orders'
import { getApiErrorMessage } from '@/utils/api-error'
import { humanizeEnum } from '@/utils/format-label'

const PAGE_SIZE = 20
const TRANSACTION_TYPES: Array<InventoryTransactionType | 'ALL'> = [
  'ALL',
  'ORDER',
  'CANCEL',
  'RETURN',
  'MANUAL_ADD',
]

export function MerchantInventoryPage() {
  const { data: products = [], isLoading: isProductsLoading } = useMyProducts()
  const [selectedProductId, setSelectedProductId] = useState('')
  const [typeFilter, setTypeFilter] = useState<InventoryTransactionType | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  const { data: transactions = [], error, isLoading, refetch } =
    useGetInventoryTransactionsQuery(
      { productId: selectedProductId, limit: 100 },
      { skip: !selectedProductId },
    )

  const filtered = useMemo(() => {
    if (typeFilter === 'ALL') return transactions
    return transactions.filter((item) => item.type === typeFilter)
  }, [transactions, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <PageContainer
      title="Inventory"
      description="Track stock movements for your products."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <Select
            value={selectedProductId || undefined}
            onValueChange={(value) => {
              setSelectedProductId(value)
              setPage(1)
            }}
          >
            <SelectTrigger id="product" className="w-full">
              <SelectValue placeholder={isProductsLoading ? 'Loading products...' : 'Select a product'} />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product._id} value={product._id}>
                  {product.title} (stock: {product.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Transaction type</Label>
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as InventoryTransactionType | 'ALL')
              setPage(1)
            }}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'ALL' ? 'All types' : humanizeEnum(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedProductId ? (
        <p className="text-sm text-muted-foreground">
          Select a product to view inventory transactions.
        </p>
      ) : error ? (
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load inventory.')}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <DataTable<InventoryTransaction>
            columns={[
              {
                key: 'date',
                header: 'Date',
                cell: (row) => formatOrderDate(row.createdAt),
              },
              {
                key: 'type',
                header: 'Type',
                cell: (row) => humanizeEnum(row.type),
              },
              { key: 'qty', header: 'Qty', cell: (row) => row.quantity },
              {
                key: 'stock',
                header: 'Stock change',
                cell: (row) => `${row.previousStock} → ${row.currentStock}`,
              },
              {
                key: 'ref',
                header: 'Reference',
                cell: (row) => row.referenceId ?? '—',
              },
            ]}
            data={paginated}
            isLoading={isLoading}
            emptyTitle="No transactions found"
            getRowKey={(row) => row._id}
          />

          <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  )
}
