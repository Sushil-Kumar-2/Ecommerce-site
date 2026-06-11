import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'

export function BackToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-20 right-4 z-30 flex size-10 items-center justify-center rounded-full bg-card text-foreground shadow-lg ring-1 ring-border/60 transition-opacity md:bottom-8',
        className,
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="size-5" />
    </button>
  )
}
