import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Autoplay from 'embla-carousel-autoplay'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ROUTES } from '@/utils/routes'
import { cn } from '@/lib/utils'

const slides = [
  {
    id: 'featured',
    title: 'Featured deals',
    subtitle: 'Hand-picked offers with the best discounts',
    href: `${ROUTES.products}?featured=true`,
    gradient: 'from-brand-primary to-blue-600',
  },
  {
    id: 'all-products',
    title: 'Explore everything',
    subtitle: 'Browse thousands of products across all categories',
    href: ROUTES.products,
    gradient: 'from-violet-600 to-brand-primary',
  },
  {
    id: 'top-rated',
    title: 'Top rated picks',
    subtitle: 'Loved by customers — shop the highest rated products',
    href: `${ROUTES.products}?sort=top_rated`,
    gradient: 'from-emerald-600 to-teal-600',
  },
] as const

interface HeroCarouselProps {
  className?: string
}

export function HeroCarousel({ className }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const autoplayPlugin = Autoplay({
    delay: 5000,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  })

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return
    setSelectedIndex(carouselApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!api) return
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api, onSelect])

  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4', className)}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{ loop: true }}
        plugins={prefersReducedMotion ? [] : [autoplayPlugin]}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Link
                to={slide.href}
                className={cn(
                  'flex min-h-[180px] flex-col justify-center rounded-xl bg-gradient-to-r p-6 text-white shadow-md transition-opacity hover:opacity-95 sm:min-h-[220px] sm:p-10',
                  slide.gradient,
                )}
              >
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">{slide.title}</h2>
                <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-base">
                  {slide.subtitle}
                </p>
                <span className="mt-4 inline-flex w-fit rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  Shop now
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 size-8 border-white/30 bg-white/90 text-foreground hover:bg-white sm:left-6 sm:size-9" />
        <CarouselNext className="right-2 size-8 border-white/30 bg-white/90 text-foreground hover:bg-white sm:right-6 sm:size-9" />
      </Carousel>

      <div className="mt-3 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              'size-2 rounded-full transition-colors',
              selectedIndex === index ? 'bg-brand-primary' : 'bg-muted-foreground/30',
            )}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
