import { Navigate, Outlet } from 'react-router-dom'

import { useAppSelector } from '@/store/hooks'
import { selectAuthUser, selectIsAuthenticated } from '@/store/slices/authSlice'
import { getDefaultRouteForRole } from '@/utils/routes'

export function GuestRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectAuthUser)

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
