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
