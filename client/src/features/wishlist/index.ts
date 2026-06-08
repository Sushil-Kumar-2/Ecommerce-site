export {
  wishlistApi,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from './wishlistApi'
export {
  useWishlist,
  useWishlistCount,
  useAddToWishlist,
  useRemoveFromWishlist,
  useMoveWishlistToCart,
} from './hooks'
export type {
  AddToWishlistRequest,
  RemoveFromWishlistResponse,
  WishlistItem,
} from './wishlist.types'
