import { baseApi } from '@/services/api'

import type {
  Address,
  CreateAddressRequest,
  DeleteAddressResponse,
  UpdateAddressRequest,
} from './address.types'

export const addressesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Address' as const, id: _id })),
              { type: 'Address', id: 'LIST' },
            ]
          : [{ type: 'Address', id: 'LIST' }],
    }),
    getAddressById: builder.query<Address, string>({
      query: (id) => `/addresses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Address', id }],
    }),
    createAddress: builder.mutation<Address, CreateAddressRequest>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    updateAddress: builder.mutation<
      Address,
      { id: string; data: UpdateAddressRequest }
    >({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
    deleteAddress: builder.mutation<DeleteAddressResponse, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    setDefaultAddress: builder.mutation<Address, string>({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressesApi
