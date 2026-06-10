import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import type { UploadImageResponse } from '@/features/uploads/upload.types'
import { env } from '@/lib/env'
import { store } from '@/store'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useChangePasswordMutation,
  useGetAccountProfileQuery,
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

  return useGetAccountProfileQuery(undefined, {
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

export async function uploadAvatarImage(file: File): Promise<string> {
  const token = store.getState().auth.token
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${env.apiUrl}/uploads/image?folder=avatars`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload avatar')
  }

  const data = (await response.json()) as UploadImageResponse
  return data.image.url
}

export function useUploadAvatar() {
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      const url = await uploadAvatarImage(file)
      return url
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { upload, isUploading }
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
