import { Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface SidebarNavItem {
  label: string
  to: string
  exact?: boolean
}

interface AppSidebarProps {
  title: string
  items: SidebarNavItem[]
}

function SidebarNavLinks({ items }: { items: SidebarNavItem[] }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact ?? false}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

export function DashboardMobileNav({ title, items }: AppSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,16rem)]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex flex-col gap-1 px-2">
          <SidebarNavLinks items={items} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export function AppSidebar({ title, items }: AppSidebarProps) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r bg-muted/20 md:block">
      <div className="flex h-full flex-col">
        <div className="border-b px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <SidebarNavLinks items={items} />
        </nav>
      </div>
    </aside>
  )
}
