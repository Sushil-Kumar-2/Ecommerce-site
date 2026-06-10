import { Outlet } from 'react-router-dom'

import { ScrollToTop } from '@/components/common/ScrollToTop'
import { PageTransition } from '@/components/design-system/PageTransition'
import {
  MobileBottomNav,
  StorefrontFooter,
  StorefrontHeader,
} from '@/components/storefront'

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <StorefrontHeader />
      <main className="flex-1 bg-muted/30 pb-16 md:pb-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <StorefrontFooter />
      <MobileBottomNav />
    </div>
  )
}
