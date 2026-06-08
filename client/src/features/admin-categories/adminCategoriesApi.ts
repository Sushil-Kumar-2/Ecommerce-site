import { baseApi } from '@/services/api'

import type {
  AdminCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './admin-category.types'

export const adminCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCategories: builder.query<AdminCategory[], void>({
      query: () => '/categories',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    getAdminCategoryById: builder.query<AdminCategory, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation<AdminCategory, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }, 'Dashboard', 'AuditLog'],
    }),
    updateCategory: builder.mutation<
      AdminCategory,
      { id: string; data: UpdateCategoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        'Dashboard',
        'AuditLog',
      ],
    }),
    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
})

export const {
  useGetAdminCategoriesQuery,
  useGetAdminCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = adminCategoriesApi
