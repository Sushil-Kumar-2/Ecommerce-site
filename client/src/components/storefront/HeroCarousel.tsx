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
    image:
      'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1400&h=500&fit=crop',
    gradient: 'from-brand-primary/90 via-brand-primary/75 to-blue-900/60',
  },
  {
    id: 'all-products',
    title: 'Explore everything',
    subtitle: 'Browse thousands of products across all categories',
    href: ROUTES.products,
    image:
      'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1400&h=500&fit=crop',
    gradient: 'from-violet-900/85 via-brand-primary/70 to-transparent',
  },
  {
    id: 'top-rated',
    title: 'Top rated picks',
    subtitle: 'Loved by customers — shop the highest rated products',
    href: `${ROUTES.products}?sort=top_rated`,
    image:
      'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1400&h=500&fit=crop',
    gradient: 'from-emerald-900/85 via-teal-800/70 to-transparent',
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
                className="group relative block min-h-[180px] overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg sm:min-h-[220px]"
              >
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={slide.id === 'featured' ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r',
                    slide.gradient,
                  )}
                  aria-hidden
                />
                <div className="relative z-10 flex min-h-[180px] flex-col justify-center p-6 text-white sm:min-h-[220px] sm:p-10">
                  <h2 className="font-heading text-2xl font-bold sm:text-3xl">{slide.title}</h2>
                  <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <span className="mt-4 inline-flex w-fit rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                    Shop now
                  </span>
                </div>
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
