import { baseApi } from '@/services/api'

import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  Profile,
  UpdateAvatarRequest,
  UpdateProfileRequest,
} from './profile.types'

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountProfile: builder.query<Profile, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<Profile, UpdateProfileRequest>({
      query: (body) => ({
        url: '/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateAvatar: builder.mutation<Profile, UpdateAvatarRequest>({
      query: (body) => ({
        url: '/profile/avatar',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: '/profile/change-password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
})

export const {
  useGetAccountProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
} = profileApi
