export {
  addressesApi,
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from './addressesApi'
export {
  useAddresses,
  useAddress,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from './hooks'
export { addressSchema, toAddressRequest } from './schemas'
export type { AddressFormValues } from './schemas'
export { AddressForm } from './components/AddressForm'
export type {
  Address,
  CreateAddressRequest,
  DeleteAddressResponse,
  UpdateAddressRequest,
} from './address.types'
