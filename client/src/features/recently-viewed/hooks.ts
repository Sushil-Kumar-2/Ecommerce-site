import { useMemo } from 'react'

import { useAuth } from '@/features/auth'

import { useGetRecentlyViewedQuery } from './recentlyViewedApi'

/** Homepage strip appears only after this many unique product views (Amazon-style). */
export const MIN_RECENTLY_VIEWED_TO_SHOW = 5

/** Matches server cap in RecentlyViewedService.addView. */
export const MAX_RECENTLY_VIEWED_ITEMS = 20

export function useRecentlyViewed() {
  const { isAuthenticated } = useAuth()

  return useGetRecentlyViewedQuery(undefined, {
    skip: !isAuthenticated,
  })
}

export function useHomeRecentlyViewed() {
  const query = useRecentlyViewed()

  const items = useMemo(
    () => (query.data ?? []).slice(0, MAX_RECENTLY_VIEWED_ITEMS),
    [query.data],
  )

  const showOnHomepage = items.length >= MIN_RECENTLY_VIEWED_TO_SHOW

  return {
    ...query,
    items,
    showOnHomepage,
  }
}
