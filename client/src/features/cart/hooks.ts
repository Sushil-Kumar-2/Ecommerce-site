import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from './cartApi'
import type { AddToCartRequest } from './cart.types'

export function useCart() {
  const { isAuthenticated } = useAuth()

  return useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  })
}

export function useCartItemCount() {
  const { data } = useCart()

  return data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

export function useAddToCart() {
  const [addToCart, state] = useAddToCartMutation()

  const add = async (payload: AddToCartRequest) => {
    try {
      await addToCart(payload).unwrap()
      toast.success('Added to cart')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add to cart.'))
      throw error
    }
  }

  return [add, state] as const
}

export function useUpdateCartItem() {
  const [updateCartItem, state] = useUpdateCartItemMutation()

  const update = async (productId: string, quantity: number) => {
    try {
      await updateCartItem({ productId, quantity }).unwrap()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update cart item.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useRemoveCartItem() {
  const [removeCartItem, state] = useRemoveCartItemMutation()

  const remove = async (productId: string) => {
    try {
      await removeCartItem(productId).unwrap()
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to remove cart item.'))
      throw error
    }
  }

  return [remove, state] as const
}

export function useClearCart() {
  const [clearCart, state] = useClearCartMutation()

  const clear = async () => {
    try {
      await clearCart().unwrap()
      toast.success('Cart cleared')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to clear cart.'))
      throw error
    }
  }

  return [clear, state] as const
}
