import type { Category, Product } from './product.types'

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getDiscountPercent(price: number, discountPrice: number): number {
  if (discountPrice <= 0 || discountPrice >= price) return 0
  return Math.round(((price - discountPrice) / price) * 100)
}

export function getEffectivePrice(price: number, discountPrice: number): number {
  return discountPrice > 0 ? discountPrice : price
}

export function getProductImage(images: string[] | undefined): string | undefined {
  return images?.[0]
}

export function getStockLabel(stock: number): { label: string; inStock: boolean } {
  if (stock <= 0) {
    return { label: 'Out of stock', inStock: false }
  }

  if (stock <= 5) {
    return { label: `Only ${stock} left`, inStock: true }
  }

  return { label: 'In stock', inStock: true }
}

export function getProductRoute(id: string): string {
  return `/products/${id}`
}

export function buildCategoryMap(categories: Category[]): Record<string, string> {
  return categories.reduce<Record<string, string>>((map, category) => {
    map[category._id] = category.name
    return map
  }, {})
}

export function isNewArrival(product: Product, days = 30): boolean {
  if (!product.createdAt) return false
  const created = new Date(product.createdAt).getTime()
  const now = Date.now()
  const diffDays = (now - created) / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

export type ProductBadge =
  | 'featured'
  | 'discount'
  | 'new'
  | 'topRated'

export function getProductBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = []

  if (product.featured) {
    badges.push('featured')
  }

  if (getDiscountPercent(product.price, product.discountPrice) > 0) {
    badges.push('discount')
  }

  if (isNewArrival(product)) {
    badges.push('new')
  }

  if (product.averageRating >= 4.5 && product.totalReviews >= 10) {
    badges.push('topRated')
  }

  return badges
}

