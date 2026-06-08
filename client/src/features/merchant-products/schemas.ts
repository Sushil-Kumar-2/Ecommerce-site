import { z } from 'zod'

export const merchantProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  discountPrice: z
    .union([z.coerce.number().min(0), z.literal('')])
    .optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or greater'),
  images: z.array(z.string()).optional(),
})

export type MerchantProductFormInput = z.input<typeof merchantProductSchema>
export type MerchantProductFormValues = z.output<typeof merchantProductSchema>
