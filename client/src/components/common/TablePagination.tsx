import { Button } from '@/components/ui/button'

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="flex items-center text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

interface StringTablePaginationProps {
  page: string
  totalPages: number
  onPageChange: (page: string) => void
}

export function StringTablePagination({
  page,
  totalPages,
  onPageChange,
}: StringTablePaginationProps) {
  if (totalPages <= 1) return null

  const pageNumber = Number(page)

  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(String(pageNumber - 1))}
      >
        Previous
      </Button>
      <span className="flex items-center text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={pageNumber >= totalPages}
        onClick={() => onPageChange(String(pageNumber + 1))}
      >
        Next
      </Button>
    </div>
  )
}
