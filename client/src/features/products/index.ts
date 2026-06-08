export {
  productsApi,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetTopRatedProductsQuery,
  useGetBestSellersQuery,
  useGetRelatedProductsQuery,
  useGetCategoriesQuery,
} from './productsApi'
export {
  useProductsCatalog,
  useProductDetail,
  useRelatedProducts,
  useTopRatedProducts,
  useBestSellers,
  useCategories,
  useProductFiltersFromUrl,
  useProductFilterUpdater,
} from './hooks'
export { ProductSort } from './product.types'
export type {
  Category,
  Product,
  ProductFilterParams,
  ProductListResponse,
  ProductPagination,
  ProductVariant,
} from './product.types'
