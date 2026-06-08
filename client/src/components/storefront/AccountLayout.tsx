import { NavLink, Outlet } from 'react-router-dom'
import {
  Heart,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Package,
  User,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/routes'

const navItems = [
  { to: ROUTES.account, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.orders, label: 'Orders', icon: Package },
  { to: ROUTES.addresses, label: 'Addresses', icon: MapPin },
  { to: ROUTES.wishlist, label: 'Wishlist', icon: Heart },
  { to: ROUTES.profile, label: 'Profile', icon: User },
  { to: ROUTES.changePassword, label: 'Change password', icon: KeyRound },
] as const

export function AccountLayout() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
      <aside className="w-full shrink-0 md:w-56">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          My account
        </p>
        <nav className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.account}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
