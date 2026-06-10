import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/common/AppSidebar'
import { Header } from '@/components/common/Header'
import { ROUTES } from '@/utils/routes'

const merchantNavItems = [
  { label: 'Dashboard', to: ROUTES.merchant, exact: true },
  { label: 'Products', to: ROUTES.merchantProducts },
  { label: 'Orders', to: ROUTES.merchantOrders },
  { label: 'Inventory', to: ROUTES.merchantInventory },
  { label: 'Reviews', to: ROUTES.merchantReviews },
]

export function MerchantLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar title="Merchant" items={merchantNavItems} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Header variant="dashboard" sidebarNav={{ title: 'Merchant', items: merchantNavItems }} />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
