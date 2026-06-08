import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { TextFormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMerchantCategories } from '@/features/merchant-products/hooks'

import { ImageUploadField } from './ImageUploadField'
import {
  merchantProductSchema,
  type MerchantProductFormInput,
  type MerchantProductFormValues,
} from '../schemas'

interface ProductFormProps {
  defaultValues?: Partial<MerchantProductFormValues>
  submitLabel?: string
  isLoading?: boolean
  onSubmit: (values: MerchantProductFormValues) => Promise<void>
}

const emptyDefaults: MerchantProductFormInput = {
  title: '',
  slug: '',
  description: '',
  categoryId: '',
  price: 0,
  discountPrice: '',
  stock: 0,
  images: [],
}

export function ProductForm({
  defaultValues,
  submitLabel = 'Save product',
  isLoading = false,
  onSubmit,
}: ProductFormProps) {
  const { data: categories = [] } = useMerchantCategories()
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? [])

  const form = useForm<
    MerchantProductFormInput,
    unknown,
    MerchantProductFormValues
  >({
    resolver: zodResolver(merchantProductSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({ ...emptyDefaults, ...defaultValues })
      setImages(defaultValues.images ?? [])
    }
  }, [defaultValues, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    const sanitizedImages = images.filter(
      (url) => typeof url === 'string' && url.trim().length > 0,
    )
    await onSubmit({ ...values, images: sanitizedImages })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextFormField control={form.control} name="title" label="Title" />
        <TextFormField control={form.control} name="slug" label="Slug" />
        <TextFormField
          control={form.control}
          name="description"
          label="Description"
        />
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            value={form.watch('categoryId') || undefined}
            onValueChange={(value) =>
              form.setValue('categoryId', value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextFormField
            control={form.control}
            name="price"
            label="Price"
            type="number"
          />
          <TextFormField
            control={form.control}
            name="discountPrice"
            label="Discount price"
            type="number"
          />
          <TextFormField
            control={form.control}
            name="stock"
            label="Stock"
            type="number"
          />
        </div>
        <ImageUploadField images={images} onChange={setImages} />
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
