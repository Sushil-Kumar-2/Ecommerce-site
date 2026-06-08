import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ProductSearch({
  value,
  onChange,
  placeholder = 'Search products...',
}: ProductSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [localValue, onChange, value])

  return (
    <div className="relative">
      <Label htmlFor="product-search" className="sr-only">
        Search products
      </Label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="product-search"
        type="search"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
