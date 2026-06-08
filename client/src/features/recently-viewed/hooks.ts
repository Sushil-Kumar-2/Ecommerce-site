import { useAuth } from '@/features/auth'

import { useGetRecentlyViewedQuery } from './recentlyViewedApi'

export function useRecentlyViewed() {
  const { isAuthenticated } = useAuth()

  return useGetRecentlyViewedQuery(undefined, {
    skip: !isAuthenticated,
  })
}
