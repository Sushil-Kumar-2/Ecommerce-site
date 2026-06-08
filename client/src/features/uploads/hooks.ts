import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { env } from '@/lib/env'
import { store } from '@/store'
import { getApiErrorMessage } from '@/utils/api-error'

import type { UploadImageResponse, UploadMultipleResponse } from './upload.types'

async function getAuthToken(): Promise<string | null> {
  const state = store.getState()
  return state.auth.token
}

async function parseUploadError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[] }
    if (typeof data.message === 'string') return data.message
    if (Array.isArray(data.message)) return data.message.join(', ')
  } catch {
    // ignore JSON parse errors
  }

  return `Upload failed (${response.status})`
}

export async function uploadProductImage(file: File): Promise<string> {
  const token = await getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${env.apiUrl}/uploads/image?folder=products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseUploadError(response))
  }

  const data = (await response.json()) as UploadImageResponse
  return data.image.url
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  const token = await getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  const response = await fetch(`${env.apiUrl}/uploads/multiple?folder=products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseUploadError(response))
  }

  const data = (await response.json()) as UploadMultipleResponse
  return data.images.map((image) => image.url)
}

export function useUploadProductImages() {
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return []

    setIsUploading(true)
    try {
      const urls =
        fileArray.length === 1
          ? [await uploadProductImage(fileArray[0])]
          : await uploadProductImages(fileArray)
      toast.success(`${urls.length} image(s) uploaded`)
      return urls
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload images.'))
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { upload, isUploading }
}
