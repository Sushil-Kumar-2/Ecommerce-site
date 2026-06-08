export interface AdminCategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
  image?: string
  isActive?: boolean
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>
