import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageContainerProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  centered?: boolean
}

export function PageContainer({
  title,
  description,
  children,
  className,
  centered = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl py-6',
        centered && 'flex min-h-[calc(100vh-8rem)] items-center justify-center',
        className,
      )}
    >
      <div className={cn('w-full', centered && 'max-w-md')}>
        {(title || description) && (
          <header className="mb-6 space-y-1">
            {title ? (
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </header>
        )}
        {children}
      </div>
    </div>
  )
}
