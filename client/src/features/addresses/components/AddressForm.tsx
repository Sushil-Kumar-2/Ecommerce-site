import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { TextFormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Label } from '@/components/ui/label'

import { addressSchema, type AddressFormValues } from '../schemas'

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>
  submitLabel?: string
  isLoading?: boolean
  onSubmit: (values: AddressFormValues) => Promise<void>
}

const emptyDefaults: AddressFormValues = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  landmark: '',
  isDefault: false,
}

export function AddressForm({
  defaultValues,
  submitLabel = 'Save address',
  isLoading = false,
  onSubmit,
}: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextFormField control={form.control} name="fullName" label="Full name" />
        <TextFormField
          control={form.control}
          name="phone"
          label="Phone"
          type="tel"
          placeholder="+91XXXXXXXXXX"
        />
        <TextFormField
          control={form.control}
          name="addressLine1"
          label="Address line 1"
        />
        <TextFormField
          control={form.control}
          name="addressLine2"
          label="Address line 2 (optional)"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextFormField control={form.control} name="city" label="City" />
          <TextFormField control={form.control} name="state" label="State" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextFormField control={form.control} name="country" label="Country" />
          <TextFormField control={form.control} name="pincode" label="Pincode" />
        </div>
        <TextFormField
          control={form.control}
          name="landmark"
          label="Landmark (optional)"
        />
        <div className="flex items-center gap-2">
          <input
            id="isDefault"
            type="checkbox"
            className="size-4 rounded border"
            {...form.register('isDefault')}
          />
          <Label htmlFor="isDefault">Set as default address</Label>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  )
}
