import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email({ message: 'Enter a valid email address' }),
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
