import { baseApi } from '@/services/api'

import type {
  Category,
  Product,
  ProductFilterParams,
  ProductListResponse,
} from './product.types'

function buildProductQueryParams(filters: ProductFilterParams): string {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, ProductFilterParams | undefined>({
      query: (filters) => `/products${buildProductQueryParams(filters ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getTopRatedProducts: builder.query<Product[], void>({
      query: () => '/products/top-rated',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'TOP_RATED' },
            ]
          : [{ type: 'Product', id: 'TOP_RATED' }],
    }),
    getBestSellers: builder.query<Product[], void>({
      query: () => '/products/best-sellers',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'BEST_SELLERS' },
            ]
          : [{ type: 'Product', id: 'BEST_SELLERS' }],
    }),
    getRelatedProducts: builder.query<Product[], string>({
      query: (id) => `/products/${id}/related`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id: `RELATED_${id}` }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetTopRatedProductsQuery,
  useGetBestSellersQuery,
  useGetRelatedProductsQuery,
  useGetCategoriesQuery,
} = productsApi
