import { Loader2, Upload, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUploadProductImages } from '@/features/uploads'

interface ImageUploadFieldProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function ImageUploadField({ images, onChange }: ImageUploadFieldProps) {
  const { upload, isUploading } = useUploadProductImages()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    try {
      const urls = await upload(files)
      onChange([...images, ...urls])
    } catch {
      // toast in hook
    }

    event.target.value = ''
  }

  const removeImage = (url: string) => {
    onChange(images.filter((image) => image !== url))
  }

  return (
    <div className="space-y-3">
      <Label>Product images</Label>
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="relative size-20 overflow-hidden rounded-lg border">
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5"
              onClick={() => removeImage(url)}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(event) => void handleFileChange(event)}
          disabled={isUploading}
        />
        {isUploading ? (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Uploading...
          </p>
        ) : (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Upload className="size-3" />
            JPEG, PNG, WebP, GIF up to 5MB
          </p>
        )}
      </div>
    </div>
  )
}
