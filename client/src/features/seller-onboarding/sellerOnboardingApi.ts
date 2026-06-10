import type { RegisterMerchantRequest, RegisterMerchantResponse } from '@/types/auth.types'
import { baseApi } from '@/services/api'

export const sellerOnboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerMerchant: builder.mutation<RegisterMerchantResponse, RegisterMerchantRequest>({
      query: (body) => ({
        url: '/users/register-merchant',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useRegisterMerchantMutation } = sellerOnboardingApi
