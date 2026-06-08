import { z } from 'zod'

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
  addressLine1: z.string().min(1, 'Address line is required').max(200),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  landmark: z.string().max(200).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

export function toAddressRequest(values: AddressFormValues): AddressFormValues {
  return {
    ...values,
    addressLine2: values.addressLine2 || undefined,
    landmark: values.landmark || undefined,
  }
}
