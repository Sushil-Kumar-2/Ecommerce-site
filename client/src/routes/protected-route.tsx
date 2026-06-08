import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/store/hooks'
import { selectAuthUser, selectIsAuthenticated } from '@/store/slices/authSlice'
import { UserRole } from '@/types/auth.types'
import { getDefaultRouteForRole, ROUTES } from '@/utils/routes'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectAuthUser)
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
