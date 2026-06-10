import { Plus } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
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
  CategoryForm,
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type AdminCategory,
  type CategoryFormValues,
} from '@/features/admin-categories'
import { getApiErrorMessage } from '@/utils/api-error'

export function AdminCategoriesPage() {
  const { data: categories = [], error, isLoading, refetch } = useAdminCategories()
  const [createCategory, { isLoading: isCreating }] = useCreateCategory()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategory()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)

  const openCreate = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (values: CategoryFormValues) => {
    if (editingCategory) {
      await updateCategory(editingCategory._id, values)
    } else {
      await createCategory(values)
    }
    closeDialog()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteCategory(deleteTarget._id)
    setDeleteTarget(null)
  }

  if (error) {
    return (
      <PageContainer title="Categories">
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load categories.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Categories"
      description="Manage product categories for the marketplace."
    >
      <div className="mb-6 flex justify-end">
        <Button onClick={openCreate}>
          <Plus />
          Add category
        </Button>
      </div>

      <DataTable<AdminCategory>
        columns={[
          {
            key: 'name',
            header: 'Name',
            cell: (row) => (
              <div className="flex items-center gap-3">
                {row.image ? (
                  <img
                    src={row.image}
                    alt=""
                    className="size-8 rounded object-cover"
                  />
                ) : null}
                <span className="font-medium">{row.name}</span>
              </div>
            ),
          },
          { key: 'slug', header: 'Slug', cell: (row) => row.slug },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.isActive ? 'secondary' : 'outline'}>
                {row.isActive ? 'Active' : 'Inactive'}
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
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={categories}
        isLoading={isLoading}
        emptyTitle="No categories"
        emptyDescription="Create a category to organize products."
        getRowKey={(row) => row._id}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit category' : 'Create category'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            parentOptions={categories
              .filter((category) => category._id !== editingCategory?._id)
              .map((category) => ({ _id: category._id, name: category.name }))}
            defaultValues={
              editingCategory
                ? {
                    name: editingCategory.name,
                    slug: editingCategory.slug,
                    description: editingCategory.description ?? '',
                    image: editingCategory.image ?? '',
                    parentCategory: editingCategory.parentCategory ?? '',
                    status: editingCategory.status ?? (editingCategory.isActive ? 'active' : 'inactive'),
                    isActive: editingCategory.isActive,
                  }
                : undefined
            }
            submitLabel={editingCategory ? 'Update category' : 'Create category'}
            isLoading={isCreating || isUpdating}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </PageContainer>
  )
}
