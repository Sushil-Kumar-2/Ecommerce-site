import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { TextFormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useUploadCategoryImage } from '../hooks'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  parentCategory: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  isActive: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryOption {
  _id: string
  name: string
}

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>
  parentOptions?: CategoryOption[]
  submitLabel?: string
  isLoading?: boolean
  onSubmit: (values: CategoryFormValues) => Promise<void>
}

const emptyDefaults: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  image: '',
  parentCategory: '',
  status: 'active',
  isActive: true,
}

export function CategoryForm({
  defaultValues,
  parentOptions = [],
  submitLabel = 'Save category',
  isLoading = false,
  onSubmit,
}: CategoryFormProps) {
  const { upload, isUploading } = useUploadCategoryImage()
  const [imageUrl, setImageUrl] = useState(defaultValues?.image ?? '')

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({ ...emptyDefaults, ...defaultValues })
      setImageUrl(defaultValues.image ?? '')
    }
  }, [defaultValues, form])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const url = await upload(file)
      setImageUrl(url)
      form.setValue('image', url)
    } catch {
      // toast in hook
    }

    event.target.value = ''
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      image: values.image || undefined,
      description: values.description || undefined,
      parentCategory: values.parentCategory || undefined,
      isActive: values.status === 'active',
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextFormField control={form.control} name="name" label="Name" />
        <TextFormField control={form.control} name="slug" label="Slug" />
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...form.register('description')}
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="space-y-3">
          <Label>Image</Label>
          {imageUrl ? (
            <div className="relative size-24 overflow-hidden rounded-lg border">
              <img src={imageUrl} alt="" className="size-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5"
                onClick={() => {
                  setImageUrl('')
                  form.setValue('image', '')
                }}
              >
                <X className="size-3" />
              </button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void handleImageUpload(event)}
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-4 text-muted-foreground" />
            )}
          </div>
          <TextFormField
            control={form.control}
            name="image"
            label="Image URL (optional)"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentCategory">Parent category (optional)</Label>
          <select
            id="parentCategory"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('parentCategory')}
          >
            <option value="">None (top-level)</option>
            {parentOptions.map((option) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('status')}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading ? <Loader2 className="animate-spin" /> : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
