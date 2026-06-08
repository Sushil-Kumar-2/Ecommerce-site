import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressByIdQuery,
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from './addressesApi'
import type { CreateAddressRequest, UpdateAddressRequest } from './address.types'

export function useAddresses() {
  const { isAuthenticated } = useAuth()

  return useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  })
}

export function useAddress(id: string | undefined) {
  const { isAuthenticated } = useAuth()

  return useGetAddressByIdQuery(id ?? '', {
    skip: !isAuthenticated || !id,
  })
}

export function useCreateAddress() {
  const [createAddress, state] = useCreateAddressMutation()

  const create = async (payload: CreateAddressRequest) => {
    try {
      const result = await createAddress(payload).unwrap()
      toast.success('Address added')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add address.'))
      throw error
    }
  }

  return [create, state] as const
}

export function useUpdateAddress() {
  const [updateAddress, state] = useUpdateAddressMutation()

  const update = async (id: string, data: UpdateAddressRequest) => {
    try {
      const result = await updateAddress({ id, data }).unwrap()
      toast.success('Address updated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update address.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useDeleteAddress() {
  const [deleteAddress, state] = useDeleteAddressMutation()

  const remove = async (id: string) => {
    try {
      await deleteAddress(id).unwrap()
      toast.success('Address deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete address.'))
      throw error
    }
  }

  return [remove, state] as const
}

export function useSetDefaultAddress() {
  const [setDefaultAddress, state] = useSetDefaultAddressMutation()

  const setDefault = async (id: string) => {
    try {
      await setDefaultAddress(id).unwrap()
      toast.success('Default address updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to set default address.'))
      throw error
    }
  }

  return [setDefault, state] as const
}
