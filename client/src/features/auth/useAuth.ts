import { useAppSelector } from '@/store/hooks'
import {
  selectAuthToken,
  selectAuthUser,
  selectIsAuthenticated,
} from '@/store/slices/authSlice'

import { useLogout } from './useLogout'

export function useAuth() {
  const user = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAuthToken)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const logout = useLogout()

  return {
    user,
    token,
    isAuthenticated,
    logout,
  }
}
