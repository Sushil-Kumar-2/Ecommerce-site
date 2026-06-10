import { Link } from 'react-router-dom'

import { ROUTES } from '@/utils/routes'

const footerColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: ROUTES.products },
      { label: 'Featured deals', to: `${ROUTES.products}?featured=true` },
      { label: 'Top rated', to: `${ROUTES.products}?sort=top_rated` },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Dashboard', to: ROUTES.account },
      { label: 'My orders', to: ROUTES.orders },
      { label: 'Addresses', to: ROUTES.addresses },
      { label: 'Wishlist', to: ROUTES.wishlist },
    ],
  },
  {
    title: 'Profile',
    links: [
      { label: 'My profile', to: ROUTES.profile },
      { label: 'Change password', to: ROUTES.changePassword },
      { label: 'Cart', to: ROUTES.cart },
      { label: 'Checkout', to: ROUTES.checkout },
    ],
  },
  {
    title: 'Sell',
    links: [{ label: 'Sell on ShopKart', to: ROUTES.becomeASeller }],
  },
] as const

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-5">
        <div>
          <Link to={ROUTES.home} className="font-heading text-lg font-semibold text-brand-primary">
            ShopKart
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Your one-stop shop for great deals on electronics, fashion, and more.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-semibold">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:text-sm">
          <p>&copy; {new Date().getFullYear()} ShopKart. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link to="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="#" className="hover:text-foreground">
              Support
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
