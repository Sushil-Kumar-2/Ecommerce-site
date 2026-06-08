import { useAuth } from '@/features/auth'
import { UserRole } from '@/types/auth.types'

export function useIsAdmin() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.role === UserRole.ADMIN
}
