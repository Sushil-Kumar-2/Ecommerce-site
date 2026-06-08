import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useIsAdmin } from '@/features/admin/hooks'
import { env } from '@/lib/env'
import { store } from '@/store'
import type { UploadImageResponse } from '@/features/uploads/upload.types'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAdminCategoriesQuery,
  useUpdateCategoryMutation,
} from './adminCategoriesApi'
import type { CreateCategoryRequest, UpdateCategoryRequest } from './admin-category.types'

export async function uploadCategoryImage(file: File): Promise<string> {
  const token = store.getState().auth.token
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${env.apiUrl}/uploads/image?folder=categories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = (await response.json()) as UploadImageResponse
  return data.image.url
}

export function useUploadCategoryImage() {
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      const url = await uploadCategoryImage(file)
      toast.success('Image uploaded')
      return url
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload image.'))
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { upload, isUploading }
}

export function useAdminCategories() {
  const isAdmin = useIsAdmin()
  return useGetAdminCategoriesQuery(undefined, { skip: !isAdmin })
}

export function useCreateCategory() {
  const isAdmin = useIsAdmin()
  const [createCategory, state] = useCreateCategoryMutation()

  const create = async (payload: CreateCategoryRequest) => {
    if (!isAdmin) throw new Error('Unauthorized')
    try {
      const result = await createCategory(payload).unwrap()
      toast.success('Category created')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create category.'))
      throw error
    }
  }

  return [create, state] as const
}

export function useUpdateCategory() {
  const isAdmin = useIsAdmin()
  const [updateCategory, state] = useUpdateCategoryMutation()

  const update = async (id: string, data: UpdateCategoryRequest) => {
    if (!isAdmin) throw new Error('Unauthorized')
    try {
      const result = await updateCategory({ id, data }).unwrap()
      toast.success('Category updated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update category.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useDeleteCategory() {
  const isAdmin = useIsAdmin()
  const [deleteCategory, state] = useDeleteCategoryMutation()

  const remove = async (id: string) => {
    if (!isAdmin) throw new Error('Unauthorized')
    try {
      await deleteCategory(id).unwrap()
      toast.success('Category deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete category.'))
      throw error
    }
  }

  return [remove, state] as const
}
