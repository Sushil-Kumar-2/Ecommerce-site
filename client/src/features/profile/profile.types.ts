export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  shopLogo: string | null
  shopName: string | null
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
}

export interface UpdateAvatarRequest {
  avatar: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}
