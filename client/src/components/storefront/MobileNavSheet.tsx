import { Link } from 'react-router-dom'
import {
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCategories } from '@/features/products'
import { ROUTES } from '@/utils/routes'

const accountLinks = [
  { to: ROUTES.account, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.orders, label: 'Orders', icon: Package },
  { to: ROUTES.addresses, label: 'Addresses', icon: MapPin },
  { to: ROUTES.wishlist, label: 'Wishlist', icon: Heart },
  { to: ROUTES.profile, label: 'Profile', icon: User },
] as const

export function MobileNavSheet() {
  const { data: categories = [] } = useCategories()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,20rem)]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-brand-primary" />
            ShopKart
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <nav className="flex flex-col gap-1">
              <Link
                to={ROUTES.products}
                className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                All products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`${ROUTES.products}?categoryId=${category._id}`}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            <nav className="flex flex-col gap-1">
              {accountLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </nav>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
