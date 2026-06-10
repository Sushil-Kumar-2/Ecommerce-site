import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Heart,
  LogOut,
  Package,
  User,
} from 'lucide-react'

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
import { NotificationDropdown } from '@/features/notifications'
import { useWishlistCount } from '@/features/wishlist'
import { getInitials } from '@/lib/user'
import { ROUTES } from '@/utils/routes'

import { CategoryNav } from './CategoryNav'
import { GlobalSearch } from './GlobalSearch'
import { MiniCartSheet } from './MiniCartSheet'
import { MobileNavSheet } from './MobileNavSheet'

const headerNavButtonClass =
  'hidden h-auto min-w-[3.5rem] flex-col gap-0.5 px-2.5 py-1.5 text-white hover:bg-white/10 md:flex md:text-foreground md:hover:bg-muted'

export function StorefrontHeader() {
  const { isAuthenticated, user, logout } = useAuth()
  const wishlistCount = useWishlistCount()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleGuestProtected = (path: string) => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-40 bg-background shadow-sm">
      <div className="bg-brand-primary px-4 py-1.5 text-center text-xs text-white md:hidden">
        Free delivery on orders above ₹499
      </div>

      <div className="border-b bg-brand-primary md:bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 md:gap-4 md:py-3">
          <MobileNavSheet />

          <Link
            to={ROUTES.home}
            className="shrink-0 font-heading text-xl font-bold italic tracking-tight text-white md:text-brand-primary"
          >
            Shop<span className="text-brand-accent">Kart</span>
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <GlobalSearch query={searchQuery} onQueryChange={setSearchQuery} />
          </div>

          <Link
            to={ROUTES.becomeASeller}
            className="hidden shrink-0 text-sm font-medium text-white underline-offset-4 hover:underline md:text-foreground"
          >
            Sell on ShopKart
          </Link>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden items-center gap-0.5 rounded-lg md:flex">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={headerNavButtonClass}>
                      <User className="size-5" />
                      <span className="text-[10px] font-medium leading-tight">Profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.account}>
                        <User />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.profile}>
                        <User />
                        Profile settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={logout}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" asChild className={headerNavButtonClass}>
                  <Link to={ROUTES.login}>
                    <User className="size-5" />
                    <span className="text-[10px] font-medium leading-tight">Profile</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                className={headerNavButtonClass}
                onClick={() => handleGuestProtected(ROUTES.orders)}
              >
                <Package className="size-5" />
                <span className="text-[10px] font-medium leading-tight">Orders</span>
              </Button>

              <MiniCartSheet variant="header" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10 md:text-foreground md:hover:bg-muted"
              onClick={() => handleGuestProtected(ROUTES.wishlist)}
              aria-label="Wishlist"
            >
              <Heart />
              {isAuthenticated && wishlistCount > 0 ? (
                <Badge className="absolute -top-1 -right-1 size-5 min-w-5 bg-brand-accent px-1 text-[0.6875rem] text-foreground">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Badge>
              ) : null}
            </Button>

            <div className="text-white md:text-foreground [&_button]:text-white md:[&_button]:text-foreground">
              <NotificationDropdown />
            </div>

            <div className="md:hidden">
              <MiniCartSheet />
            </div>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative size-9 rounded-full p-0 md:hidden"
                    aria-label="Account menu"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.profile}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.orders}>Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="md:hidden">
                <Link to={ROUTES.login}>Login</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="px-4 pb-2 md:hidden">
          <GlobalSearch query={searchQuery} onQueryChange={setSearchQuery} />
        </div>
      </div>

      <CategoryNav className="hidden md:flex" />
    </header>
  )
}
