import { useCallback, useEffect, useRef, useState } from 'react'

interface UseHorizontalScrollOptions {
  cardSelector: string
  cardScrollCount: number
  gap?: number
}

export interface ScrollMetrics {
  overflow: boolean
  canScrollLeft: boolean
  canScrollRight: boolean
  maxScrollLeft: number
  scrollLeft: number
}

export function readScrollMetrics(viewport: HTMLDivElement): ScrollMetrics {
  const { scrollLeft, scrollWidth, clientWidth } = viewport
  const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
  const overflow = maxScrollLeft > 1

  return {
    overflow,
    canScrollLeft: overflow && scrollLeft > 1,
    canScrollRight: overflow && scrollLeft < maxScrollLeft - 1,
    maxScrollLeft,
    scrollLeft,
  }
}

function applyScrollMetrics(
  metrics: ScrollMetrics,
  setHasOverflow: (value: boolean) => void,
  setCanScrollLeft: (value: boolean) => void,
  setCanScrollRight: (value: boolean) => void,
) {
  setHasOverflow(metrics.overflow)
  setCanScrollLeft(metrics.canScrollLeft)
  setCanScrollRight(metrics.canScrollRight)
}

export function useHorizontalScroll(
  itemCount: number,
  { cardSelector, cardScrollCount, gap = 12 }: UseHorizontalScrollOptions,
) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const scrollAnimationRef = useRef<number | null>(null)

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    applyScrollMetrics(
      readScrollMetrics(viewport),
      setHasOverflow,
      setCanScrollLeft,
      setCanScrollRight,
    )
  }, [])

  const trackScrollAnimation = useCallback(() => {
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }

      const startedAt = performance.now()

      const tick = () => {
        updateScrollState()

        if (performance.now() - startedAt < 700) {
          scrollAnimationRef.current = requestAnimationFrame(tick)
        } else {
          scrollAnimationRef.current = null
        }
      }

      scrollAnimationRef.current = requestAnimationFrame(tick)
  }, [updateScrollState])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const sync = () => updateScrollState()

    sync()
    viewport.addEventListener('scroll', sync, { passive: true })
    viewport.addEventListener('scrollend', sync, { passive: true })
    window.addEventListener('resize', sync)
    window.addEventListener('load', sync)

    const resizeObserver = new ResizeObserver(sync)
    resizeObserver.observe(viewport)
    Array.from(viewport.children).forEach((child) => {
      resizeObserver.observe(child)
    })

    const mutationObserver = new MutationObserver(() => {
      sync()
      Array.from(viewport.children).forEach((child) => {
        resizeObserver.observe(child)
      })
      viewport.querySelectorAll('img').forEach((image) => {
        if (!image.complete) {
          image.addEventListener('load', sync, { once: true })
        }
      })
    })
    mutationObserver.observe(viewport, { childList: true, subtree: true })

    viewport.querySelectorAll('img').forEach((image) => {
      if (!image.complete) {
        image.addEventListener('load', sync, { once: true })
      }
    })

    const deferredSyncTimers = [0, 50, 150, 400, 800].map((delay) =>
      window.setTimeout(sync, delay),
    )

    return () => {
      viewport.removeEventListener('scroll', sync)
      viewport.removeEventListener('scrollend', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('load', sync)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      deferredSyncTimers.forEach((timer) => window.clearTimeout(timer))
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [itemCount, updateScrollState])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const viewport = viewportRef.current
      if (!viewport) return

      const metrics = readScrollMetrics(viewport)

      const firstCard = viewport.querySelector<HTMLElement>(cardSelector)
      const cardWidth = firstCard?.offsetWidth ?? 168
      const flexGap =
        Number.parseFloat(getComputedStyle(viewport).columnGap || String(gap)) || gap
      const step = (cardWidth + flexGap) * cardScrollCount
      const current = viewport.scrollLeft
      const target =
        direction === 'left'
          ? Math.max(0, current - step)
          : Math.min(metrics.maxScrollLeft, current + step)

      if (Math.abs(target - current) < 1) return

      viewport.scrollTo({
        left: target,
        behavior: 'auto',
      })

      applyScrollMetrics(
        {
          overflow: metrics.overflow,
          canScrollLeft: target > 1,
          canScrollRight: target < metrics.maxScrollLeft - 1,
          maxScrollLeft: metrics.maxScrollLeft,
          scrollLeft: target,
        },
        setHasOverflow,
        setCanScrollLeft,
        setCanScrollRight,
      )

      trackScrollAnimation()
    },
    [cardSelector, cardScrollCount, gap, trackScrollAnimation],
  )

  return {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft: () => scroll('left'),
    scrollRight: () => scroll('right'),
  }
}
