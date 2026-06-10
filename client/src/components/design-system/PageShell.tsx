import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageShellVariant = 'storefront' | 'dashboard' | 'account' | 'auth' | 'full'

const variantStyles: Record<PageShellVariant, string> = {
  storefront: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
  dashboard: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
  account: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8',
  auth: 'mx-auto w-full max-w-md px-4 py-8',
  full: 'w-full px-4 py-6 sm:px-6 sm:py-8',
}

interface PageShellProps {
  children: ReactNode
  variant?: PageShellVariant
  className?: string
  centered?: boolean
}

export function PageShell({
  children,
  variant = 'storefront',
  className,
  centered = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        centered && 'flex min-h-[calc(100vh-8rem)] items-center justify-center',
        className,
      )}
    >
      <div className={cn('w-full', centered && 'max-w-md')}>{children}</div>
    </div>
  )
}
