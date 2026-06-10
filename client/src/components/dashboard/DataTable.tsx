import type { ReactNode } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  mobileLabel?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  skeletonRows?: number
  emptyTitle?: string
  emptyDescription?: string
  getRowKey: (row: T) => string
  toolbar?: ReactNode
  footer?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  emptyTitle = 'No data',
  emptyDescription,
  getRowKey,
  toolbar,
  footer,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {toolbar}
        <div className="space-y-2 rounded-xl border p-4">
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {toolbar}
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {toolbar}
      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <Card key={getRowKey(row)} className="shadow-sm">
            <CardContent className="space-y-2 p-4">
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="shrink-0 text-muted-foreground">
                    {column.mobileLabel ?? column.header}
                  </span>
                  <span className="text-right">{column.cell(row)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {footer}
    </div>
  )
}
