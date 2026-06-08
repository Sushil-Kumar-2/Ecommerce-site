import { Outlet } from 'react-router-dom'

import { StorefrontFooter, StorefrontHeader } from '@/components/storefront'

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      <main className="flex-1 bg-muted/30">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  )
}
