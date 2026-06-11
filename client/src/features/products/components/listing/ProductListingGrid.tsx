import { motion, useReducedMotion } from 'framer-motion'

import type { Product } from '@/features/products/product.types'
import { cn } from '@/lib/utils'

import { ProductListingCard } from './ProductListingCard'

type ViewMode = 'grid' | 'list'

interface ProductListingGridProps {
  products: Product[]
  categoryMap: Record<string, string>
  viewMode?: ViewMode
  animationKey?: string
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

const gridClassName =
  'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4'

export function ProductListingGrid({
  products,
  categoryMap,
  viewMode = 'grid',
  animationKey,
  className,
}: ProductListingGridProps) {
  const prefersReducedMotion = useReducedMotion()
  const isList = viewMode === 'list'

  if (prefersReducedMotion) {
    return (
      <div className={cn(isList ? 'flex flex-col gap-4' : gridClassName, className)}>
        {products.map((product) => (
          <div key={product._id} className={cn(!isList && 'h-full')}>
            <ProductListingCard
              product={product}
              categoryName={categoryMap[product.categoryId]}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      key={animationKey}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(isList ? 'flex flex-col gap-4' : gridClassName, className)}
    >
      {products.map((product) => (
        <motion.div key={product._id} variants={itemVariants} className={cn(!isList && 'h-full')}>
          <ProductListingCard
            product={product}
            categoryName={categoryMap[product.categoryId]}
            viewMode={viewMode}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
