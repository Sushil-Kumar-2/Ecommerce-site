import { Link } from 'react-router-dom'
import {
  Heart,
  KeyRound,
  MapPin,
  Package,
  User,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/utils/routes'

const tiles = [
  {
    to: ROUTES.orders,
    title: 'Your Orders',
    description: 'Track, return, or buy again',
    icon: Package,
  },
  {
    to: ROUTES.addresses,
    title: 'Your Addresses',
    description: 'Edit addresses for orders',
    icon: MapPin,
  },
  {
    to: ROUTES.wishlist,
    title: 'Your Wishlist',
    description: 'Saved items you love',
    icon: Heart,
  },
  {
    to: ROUTES.profile,
    title: 'Login & Profile',
    description: 'Edit name, email, phone',
    icon: User,
  },
  {
    to: ROUTES.changePassword,
    title: 'Change Password',
    description: 'Update your password',
    icon: KeyRound,
  },
  {
    to: ROUTES.products,
    title: 'Continue Shopping',
    description: 'Browse latest deals',
    icon: Package,
  },
] as const

export function AccountDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Your Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage orders, addresses, and account settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-primary/10">
                  <Icon className="size-5 text-brand-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
