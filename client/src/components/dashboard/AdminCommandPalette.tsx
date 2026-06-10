import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ROUTES } from '@/utils/routes'

const adminLinks = [
  { label: 'Dashboard', to: ROUTES.admin },
  { label: 'Merchants', to: ROUTES.adminMerchants },
  { label: 'Products', to: ROUTES.adminProducts },
  { label: 'Categories', to: ROUTES.adminCategories },
  { label: 'Coupons', to: ROUTES.adminCoupons },
  { label: 'Users', to: ROUTES.adminUsers },
  { label: 'Reports', to: ROUTES.adminReports },
  { label: 'Audit Logs', to: ROUTES.adminAuditLogs },
]

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search admin pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {adminLinks.map((link) => (
            <CommandItem
              key={link.to}
              onSelect={() => {
                navigate(link.to)
                setOpen(false)
              }}
            >
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => {
              navigate(ROUTES.adminProducts)
              setOpen(false)
            }}
          >
            Review pending products
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate(ROUTES.adminReports)
              setOpen(false)
            }}
          >
            View product reports
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
