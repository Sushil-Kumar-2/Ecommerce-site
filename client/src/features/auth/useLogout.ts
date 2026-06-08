import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAppDispatch } from '@/store/hooks'
import { clearCredentials } from '@/store/slices/authSlice'
import { ROUTES } from '@/utils/routes'

export function useLogout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useCallback(() => {
    dispatch(clearCredentials())
    toast.success('You have been logged out.')
    navigate(ROUTES.login, { replace: true })
  }, [dispatch, navigate])
}
