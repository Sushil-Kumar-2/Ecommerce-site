import { baseApi } from '@/services/api'
import type { Category } from '@/features/products/product.types'

import type {
  CreateMerchantProductRequest,
  MerchantProduct,
  UpdateMerchantProductRequest,
} from './merchant-product.types'

export const merchantProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProducts: builder.query<MerchantProduct[], void>({
      query: () => '/products/my-products',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'MY_LIST' },
            ]
          : [{ type: 'Product', id: 'MY_LIST' }],
    }),
    getMerchantProductById: builder.query<MerchantProduct, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<MerchantProduct, CreateMerchantProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'MY_LIST' }, 'Dashboard'],
    }),
    updateProduct: builder.mutation<
      MerchantProduct,
      { id: string; data: UpdateMerchantProductRequest }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'MY_LIST' },
        'Dashboard',
        'Inventory',
      ],
    }),
    deleteProduct: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'MY_LIST' }, 'Dashboard'],
    }),
    getMerchantCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
})

export const {
  useGetMyProductsQuery,
  useGetMerchantProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetMerchantCategoriesQuery,
} = merchantProductsApi
