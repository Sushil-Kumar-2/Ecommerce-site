import { toast } from 'sonner'

import { useAddToCartMutation } from '@/features/cart/cartApi'
import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from './wishlistApi'
import type { AddToWishlistRequest } from './wishlist.types'

export function useWishlist() {
  const { isAuthenticated } = useAuth()

  return useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  })
}

export function useWishlistCount() {
  const { data } = useWishlist()
  return data?.length ?? 0
}

export function useAddToWishlist() {
  const [addToWishlist, state] = useAddToWishlistMutation()

  const add = async (payload: AddToWishlistRequest) => {
    try {
      await addToWishlist(payload).unwrap()
      toast.success('Added to wishlist')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add to wishlist.'))
      throw error
    }
  }

  return [add, state] as const
}

export function useRemoveFromWishlist() {
  const [removeFromWishlist, state] = useRemoveFromWishlistMutation()

  const remove = async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap()
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to remove from wishlist.'))
      throw error
    }
  }

  return [remove, state] as const
}

export function useMoveWishlistToCart() {
  const [addToCart, addState] = useAddToCartMutation()
  const [removeFromWishlist, removeState] = useRemoveFromWishlistMutation()

  const move = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 }).unwrap()
      await removeFromWishlist(productId).unwrap()
      toast.success('Moved to cart')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to move item to cart.'))
      throw error
    }
  }

  return [move, { isLoading: addState.isLoading || removeState.isLoading }] as const
}
