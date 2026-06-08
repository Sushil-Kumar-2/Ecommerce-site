import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/common/AppSidebar'
import { Header } from '@/components/common/Header'
import { ROUTES } from '@/utils/routes'

const adminNavItems = [
  { label: 'Dashboard', to: ROUTES.admin, exact: true },
  { label: 'Merchants', to: ROUTES.adminMerchants },
  { label: 'Products', to: ROUTES.adminProducts },
  { label: 'Categories', to: ROUTES.adminCategories },
  { label: 'Coupons', to: ROUTES.adminCoupons },
  { label: 'Users', to: ROUTES.adminUsers },
  { label: 'Reports', to: ROUTES.adminReports },
  { label: 'Audit Logs', to: ROUTES.adminAuditLogs },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar title="Admin" items={adminNavItems} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header variant="dashboard" sidebarNav={{ title: 'Admin', items: adminNavItems }} />
        <main className="flex-1 bg-background p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
