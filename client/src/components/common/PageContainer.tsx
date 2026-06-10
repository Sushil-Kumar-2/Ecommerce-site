import type { ReactNode } from 'react'

import {
  PageHeader,
  PageShell,
  type BreadcrumbItemConfig,
} from '@/components/design-system'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItemConfig[]
  actions?: ReactNode
  children: ReactNode
  className?: string
  centered?: boolean
  variant?: 'storefront' | 'dashboard' | 'account' | 'auth' | 'full'
}

export function PageContainer({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
  centered = false,
  variant = 'dashboard',
}: PageContainerProps) {
  return (
    <PageShell variant={variant} centered={centered} className={className}>
      {title ? (
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
      ) : null}
      <div className={cn('w-full', centered && 'max-w-md')}>{children}</div>
    </PageShell>
  )
}
