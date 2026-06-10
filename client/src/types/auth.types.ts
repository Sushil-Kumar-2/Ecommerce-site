export const UserRole = {
  USER: 'user',
  MERCHANT: 'merchant',
  ADMIN: 'admin',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface AuthUser {
  userId: string
  email: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'user' | 'merchant'
}

export interface RegisterResponse {
  _id: string
  name: string
  email: string
  role: UserRole
}

export interface RegisterMerchantRequest {
  name: string
  email: string
  password: string
  phone: string
  shopName: string
  shopDescription: string
  businessAddress: string
  gstNumber?: string
}

export interface RegisterMerchantResponse {
  _id: string
  name: string
  email: string
  role: UserRole
  status: string
  shopName: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
}
