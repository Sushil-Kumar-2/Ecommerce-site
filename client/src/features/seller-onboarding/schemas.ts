import { z } from 'zod'

export const becomeSellerSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.email({ message: 'Enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    phone: z.string().min(10, { message: 'Enter a valid phone number' }),
    shopName: z.string().min(1, { message: 'Shop name is required' }),
    shopDescription: z.string().min(10, { message: 'Shop description must be at least 10 characters' }),
    businessAddress: z.string().min(5, { message: 'Business address is required' }),
    gstNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) =>
      !data.gstNumber?.trim() || /^[0-9A-Z]{15}$/i.test(data.gstNumber.trim()),
    { message: 'GST must be 15 alphanumeric characters', path: ['gstNumber'] },
  )

export type BecomeSellerFormValues = z.infer<typeof becomeSellerSchema>

export function toRegisterMerchantRequest(values: BecomeSellerFormValues) {
  const { confirmPassword: _, gstNumber, ...rest } = values
  return {
    ...rest,
    gstNumber: gstNumber?.trim() ? gstNumber.trim().toUpperCase() : undefined,
  }
}
