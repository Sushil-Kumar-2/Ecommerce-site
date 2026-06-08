export interface Address {
  _id: string
  userId: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  pincode: string
  landmark?: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateAddressRequest {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  pincode: string
  landmark?: string
  isDefault?: boolean
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>

export interface DeleteAddressResponse {
  success: boolean
  message: string
}
