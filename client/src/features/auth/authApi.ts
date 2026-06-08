import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth.types'
import { baseApi } from '@/services/api'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query<AuthUser, void>({
      query: () => '/auth/profile',
      providesTags: ['Auth'],
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } =
  authApi
