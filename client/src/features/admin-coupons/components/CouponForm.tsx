import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { TextFormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Label } from '@/components/ui/label'

import { DiscountType } from '../admin-coupon.types'

export const couponSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]),
    discountValue: z.coerce.number().min(1, 'Discount value must be at least 1'),
    minimumOrderAmount: z.coerce.number().min(0).optional(),
    maximumDiscountAmount: z.coerce.number().min(0).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    isActive: z.boolean(),
    usageLimit: z.coerce.number().min(1).optional(),
  })
  .refine((data) => new Date(data.expiryDate) > new Date(data.startDate), {
    message: 'Expiry date must be after start date',
    path: ['expiryDate'],
  })

export type CouponFormInput = z.input<typeof couponSchema>
export type CouponFormValues = z.output<typeof couponSchema>

interface CouponFormProps {
  defaultValues?: Partial<CouponFormInput>
  submitLabel?: string
  isLoading?: boolean
  isEdit?: boolean
  onSubmit: (values: CouponFormValues) => Promise<void>
}

const emptyDefaults: CouponFormInput = {
  code: '',
  name: '',
  description: '',
  discountType: DiscountType.PERCENTAGE,
  discountValue: 10,
  minimumOrderAmount: 0,
  maximumDiscountAmount: '',
  startDate: '',
  expiryDate: '',
  isActive: true,
  usageLimit: '',
}

export function CouponForm({
  defaultValues,
  submitLabel = 'Save coupon',
  isLoading = false,
  isEdit = false,
  onSubmit,
}: CouponFormProps) {
  const form = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({ ...emptyDefaults, ...defaultValues })
    }
  }, [defaultValues, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      description: values.description || undefined,
      minimumOrderAmount: values.minimumOrderAmount ?? 0,
      maximumDiscountAmount: values.maximumDiscountAmount || undefined,
      usageLimit: values.usageLimit || undefined,
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextFormField
          control={form.control}
          name="code"
          label="Code"
          placeholder="SAVE20"
        />
        <TextFormField control={form.control} name="name" label="Name" />
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...form.register('description')}
            rows={2}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount type</Label>
          <select
            id="discountType"
            {...form.register('discountType')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value={DiscountType.PERCENTAGE}>Percentage</option>
            <option value={DiscountType.FIXED}>Fixed amount</option>
          </select>
        </div>
        <TextFormField
          control={form.control}
          name="discountValue"
          label="Discount value"
          type="number"
        />
        <TextFormField
          control={form.control}
          name="minimumOrderAmount"
          label="Minimum order amount"
          type="number"
        />
        <TextFormField
          control={form.control}
          name="maximumDiscountAmount"
          label="Maximum discount cap (optional)"
          type="number"
        />
        <TextFormField
          control={form.control}
          name="startDate"
          label="Start date"
          type="datetime-local"
        />
        <TextFormField
          control={form.control}
          name="expiryDate"
          label="Expiry date"
          type="datetime-local"
        />
        <TextFormField
          control={form.control}
          name="usageLimit"
          label="Usage limit (optional)"
          type="number"
        />
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            className="size-4 rounded border"
            {...form.register('isActive')}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            submitLabel || (isEdit ? 'Update coupon' : 'Create coupon')
          )}
        </Button>
      </form>
    </Form>
  )
}
