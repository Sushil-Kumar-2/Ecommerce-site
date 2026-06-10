import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAppDispatch } from '@/store/hooks'
import { clearCredentials } from '@/store/slices/authSlice'

import { useLogoutMutation } from './authApi'
import { ROUTES } from '@/utils/routes'

export function useLogout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logoutRequest] = useLogoutMutation()

  return useCallback(async () => {
    try {
      await logoutRequest().unwrap()
    } catch {
      // Clear local session even if server logout fails
    }

    dispatch(clearCredentials())
    toast.success('You have been logged out.')
    navigate(ROUTES.login, { replace: true })
  }, [dispatch, navigate, logoutRequest])
}
