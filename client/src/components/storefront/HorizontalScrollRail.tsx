import type { MouseEvent, ReactNode, RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_SLOT_CLASS = 'hidden w-10 shrink-0 sm:block'
const SCROLL_NAV_BTN_CLASS =
  'size-10 w-full shrink-0 rounded-full border-border bg-background shadow-md transition-[opacity,transform] duration-200 active:!translate-y-0'

interface HorizontalScrollRailProps {
  viewportRef: RefObject<HTMLDivElement | null>
  canScrollLeft: boolean
  canScrollRight: boolean
  hasOverflow: boolean
  onScrollLeft: () => void
  onScrollRight: () => void
  children: ReactNode
  className?: string
  viewportClassName?: string
}

function runScrollAction(event: MouseEvent<HTMLButtonElement>, action: () => void) {
  event.preventDefault()
  event.stopPropagation()
  action()
}

function navButtonClass(enabled: boolean): string {
  return cn(
    SCROLL_NAV_BTN_CLASS,
    'inline-flex',
    enabled
      ? 'pointer-events-auto cursor-pointer opacity-100'
      : 'pointer-events-none cursor-default opacity-35 saturate-0',
  )
}

export function HorizontalScrollRail({
  viewportRef,
  canScrollLeft,
  canScrollRight,
  hasOverflow,
  onScrollLeft,
  onScrollRight,
  children,
  className,
  viewportClassName,
}: HorizontalScrollRailProps) {
  const viewport = (
    <div
      ref={viewportRef}
      className={cn(
        'min-w-0 flex-1 overflow-x-auto scroll-smooth overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        viewportClassName,
      )}
    >
      {children}
    </div>
  )

  if (!hasOverflow) {
    return <div className={cn('flex items-center', className)}>{viewport}</div>
  }

  return (
    <div className={cn('flex items-center gap-1 sm:gap-2', className)}>
      <div className={NAV_SLOT_CLASS}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Scroll left"
          aria-disabled={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
          className={navButtonClass(canScrollLeft)}
          onClick={(event) => runScrollAction(event, onScrollLeft)}
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>

      {viewport}

      <div className={NAV_SLOT_CLASS}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Scroll right"
          aria-disabled={!canScrollRight}
          tabIndex={canScrollRight ? 0 : -1}
          className={navButtonClass(canScrollRight)}
          onClick={(event) => runScrollAction(event, onScrollRight)}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
