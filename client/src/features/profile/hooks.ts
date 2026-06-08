import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from './profileApi'
import type {
  ChangePasswordRequest,
  UpdateAvatarRequest,
  UpdateProfileRequest,
} from './profile.types'

export function useProfile() {
  const { isAuthenticated } = useAuth()

  return useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
}

export function useUpdateProfile() {
  const [updateProfile, state] = useUpdateProfileMutation()

  const update = async (payload: UpdateProfileRequest) => {
    try {
      const result = await updateProfile(payload).unwrap()
      toast.success('Profile updated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update profile.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useUpdateAvatar() {
  const [updateAvatar, state] = useUpdateAvatarMutation()

  const update = async (payload: UpdateAvatarRequest) => {
    try {
      const result = await updateAvatar(payload).unwrap()
      toast.success('Avatar updated')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update avatar.'))
      throw error
    }
  }

  return [update, state] as const
}

export function useChangePassword() {
  const [changePassword, state] = useChangePasswordMutation()

  const change = async (payload: ChangePasswordRequest) => {
    try {
      const result = await changePassword(payload).unwrap()
      toast.success(result.message)
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to change password.'))
      throw error
    }
  }

  return [change, state] as const
}
