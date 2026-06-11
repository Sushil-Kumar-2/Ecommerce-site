import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { getProductImage, getProductRoute } from '@/features/products/utils'
import type { Category, Product } from '@/features/products/product.types'

interface HomeCategoryCardProps {
  title: string
  href: string
  products: Product[]
  category?: Category
  className?: string
}

export function HomeCategoryCard({
  title,
  href,
  products,
  category,
  className,
}: HomeCategoryCardProps) {
  const slots = Array.from({ length: 4 }, (_, index) => {
    const product = products[index]
    if (product) {
      const image = getProductImage(product.images)
      return {
        key: product._id,
        href: getProductRoute(product._id),
        image,
        label: product.title,
      }
    }

    if (category?.image && index === 0) {
      return {
        key: `${category._id}-cat`,
        href,
        image: category.image,
        label: category.name,
      }
    }

    return null
  }).filter(Boolean) as Array<{
    key: string
    href: string
    image: string | null
    label: string
  }>

  if (slots.length === 0) return null

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-sm bg-card p-4 shadow-sm ring-1 ring-border/40',
        className,
      )}
    >
      <h3 className="mb-3 line-clamp-2 text-base font-bold leading-snug text-foreground">
        {title}
      </h3>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {slots.map((slot) => (
          <Link
            key={slot.key}
            to={slot.href}
            className="group flex flex-col gap-1.5"
          >
            <div className="aspect-square overflow-hidden rounded-sm bg-muted/40">
              {slot.image ? (
                <img
                  src={slot.image}
                  alt=""
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <span className="line-clamp-2 text-xs leading-snug text-foreground">
              {slot.label}
            </span>
          </Link>
        ))}
      </div>

      <Link
        to={href}
        className="mt-4 text-sm font-medium text-brand-primary hover:text-brand-primary/80 hover:underline"
      >
        See more
      </Link>
    </article>
  )
}
