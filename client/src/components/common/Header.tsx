import { Link } from 'react-router-dom'
import { Heart, LogOut, Package, ShoppingCart, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth'
import { useCartItemCount } from '@/features/cart'
import { NotificationDropdown } from '@/features/notifications'
import { useWishlistCount } from '@/features/wishlist'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/auth.types'
import { getDefaultRouteForRole, ROUTES } from '@/utils/routes'

import { ThemeToggle } from './ThemeToggle'
import { DashboardMobileNav, type SidebarNavItem } from './AppSidebar'

interface HeaderProps {
  variant?: 'customer' | 'dashboard'
  sidebarNav?: {
    title: string
    items: SidebarNavItem[]
  }
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export function Header({ variant = 'customer', sidebarNav }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const cartCount = useCartItemCount()
  const wishlistCount = useWishlistCount()

  const homeRoute =
    isAuthenticated && user ? getDefaultRouteForRole(user.role) : ROUTES.home

  const dashboardLinks =
    user?.role === UserRole.ADMIN
      ? [
          { to: ROUTES.adminMerchants, label: 'Merchants' },
          { to: ROUTES.adminUsers, label: 'Users' },
          { to: ROUTES.adminProducts, label: 'Products' },
        ]
      : user?.role === UserRole.MERCHANT
        ? [
            { to: ROUTES.merchantProducts, label: 'Products' },
            { to: ROUTES.merchantOrders, label: 'Orders' },
            { to: ROUTES.merchantInventory, label: 'Inventory' },
          ]
        : []

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        variant === 'dashboard' && 'md:pl-0',
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          {variant === 'dashboard' && sidebarNav ? (
            <DashboardMobileNav title={sidebarNav.title} items={sidebarNav.items} />
          ) : null}
          <Link
            to={homeRoute}
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Shop<span className="text-brand-accent">Kart</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && variant === 'customer' ? (
            <>
              <NotificationDropdown />
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to={ROUTES.wishlist} aria-label="Wishlist">
                  <Heart />
                  {wishlistCount > 0 ? (
                    <Badge className="absolute -top-1 -right-1 size-5 min-w-5 px-1 text-[10px]">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Badge>
                  ) : null}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to={ROUTES.cart} aria-label="Shopping cart">
                  <ShoppingCart />
                  {cartCount > 0 ? (
                    <Badge className="absolute -top-1 -right-1 size-5 min-w-5 px-1 text-[10px]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  ) : null}
                </Link>
              </Button>
            </>
          ) : null}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-9 rounded-full p-0">
                  <Avatar size="sm">
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {variant === 'dashboard' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.home}>Storefront</Link>
                    </DropdownMenuItem>
                    {dashboardLinks.map((link) => (
                      <DropdownMenuItem key={link.to} asChild>
                        <Link to={link.to}>{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.profile}>
                        <User />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.orders}>
                        <Package />
                        My orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to={ROUTES.login}>Login</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.register}>Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
