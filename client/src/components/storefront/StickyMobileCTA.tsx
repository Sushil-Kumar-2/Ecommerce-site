import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface StickyMobileCTAProps {
  children: ReactNode
  className?: string
}

export function StickyMobileCTA({ children, className }: StickyMobileCTAProps) {
  return (
    <div
      className={cn(
        'fixed right-0 bottom-16 left-0 z-30 border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
