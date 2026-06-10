import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageContainer } from '@/components/common/PageContainer'
import { useRefreshSessionMutation } from '@/features/auth/authApi'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/authSlice'
import { decodeJwtPayload, mapJwtPayloadToAuthUser } from '@/utils/jwt'
import { getDefaultRouteForRole, ROUTES } from '@/utils/routes'

export function GoogleCallbackPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [refreshSession] = useRefreshSessionMutation()

  useEffect(() => {
    let cancelled = false

    const completeGoogleSignIn = async () => {
      try {
        const response = await refreshSession().unwrap()
        const payload = decodeJwtPayload(response.accessToken)

        if (!payload) {
          throw new Error('Invalid authentication token received.')
        }

        if (cancelled) {
          return
        }

        dispatch(
          setCredentials({
            token: response.accessToken,
            user: mapJwtPayloadToAuthUser(payload),
          }),
        )

        toast.success('Signed in with Google')
        navigate(getDefaultRouteForRole(payload.role), { replace: true })
      } catch {
        if (!cancelled) {
          toast.error('Google sign-in failed. Please try again.')
          navigate(ROUTES.login, { replace: true })
        }
      }
    }

    void completeGoogleSignIn()

    return () => {
      cancelled = true
    }
  }, [dispatch, navigate, refreshSession])

  return (
    <PageContainer centered className="py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-brand-primary" />
        <p className="text-sm text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </PageContainer>
  )
}
