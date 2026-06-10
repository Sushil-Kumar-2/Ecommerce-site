import { Home, Package, ShoppingCart, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth'
import { useCartItemCount } from '@/features/cart'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/routes'

interface NavItem {
  to: string
  label: string
  icon: typeof Home
  exact: boolean
  showCartCount?: boolean
  requiresAuth?: boolean
}

const navItems: NavItem[] = [
  { to: ROUTES.home, label: 'Home', icon: Home, exact: true },
  { to: ROUTES.products, label: 'Shop', icon: Package, exact: false },
  { to: ROUTES.cart, label: 'Cart', icon: ShoppingCart, exact: true, showCartCount: true },
  { to: ROUTES.account, label: 'Account', icon: User, exact: true, requiresAuth: true },
]

export function MobileBottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const cartCount = useCartItemCount()

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1">
        {navItems.map((item) => {
          if (item.requiresAuth && !isAuthenticated) {
            return (
              <Link
                key={item.to}
                to={ROUTES.login}
                state={{ from: location }}
                className="flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-muted-foreground"
              >
                <item.icon className="size-5" />
                <span className="text-[0.6875rem] font-medium">{item.label}</span>
              </Link>
            )
          }

          const active = isActive(item.to, item.exact)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 px-2 py-2 transition-colors',
                active
                  ? 'text-brand-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="size-5" />
              {'showCartCount' in item && item.showCartCount && cartCount > 0 ? (
                <span className="absolute top-1 right-3 flex size-4 items-center justify-center rounded-full bg-brand-primary text-[0.625rem] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
              <span className="text-[0.6875rem] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
