import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageContainer } from '@/components/common/PageContainer'
import { TextFormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import {
  GoogleSignInButton,
  loginSchema,
  useLoginMutation,
  type LoginFormValues,
} from '@/features/auth'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/authSlice'
import { getApiErrorMessage } from '@/utils/api-error'
import { decodeJwtPayload, mapJwtPayloadToAuthUser } from '@/utils/jwt'
import { getDefaultRouteForRole, ROUTES } from '@/utils/routes'

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  merchant_pending: 'Your seller application is still under review.',
  account_blocked: 'Your account has been blocked. Please contact support.',
  google_failed: 'Google sign-in failed. Please try again.',
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const redirectPath =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
    null

  useEffect(() => {
    const error = searchParams.get('error')

    if (!error) {
      return
    }

    toast.error(GOOGLE_ERROR_MESSAGES[error] ?? GOOGLE_ERROR_MESSAGES.google_failed)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await login(values).unwrap()
      const payload = decodeJwtPayload(response.accessToken)

      if (!payload) {
        toast.error('Invalid authentication token received.')
        return
      }

      dispatch(
        setCredentials({
          token: response.accessToken,
          user: mapJwtPayloadToAuthUser(payload),
        }),
      )

      toast.success('Welcome back!')
      navigate(
        redirectPath ?? getDefaultRouteForRole(payload.role),
        { replace: true },
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to sign in.'))
    }
  })

  return (
    <PageContainer centered className="py-10">
      <div className="mb-6 text-center">
        <Link
          to={ROUTES.home}
          className="font-heading text-2xl font-bold italic tracking-tight text-brand-primary"
        >
          Shop<span className="text-brand-accent">Kart</span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <TextFormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <TextFormField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <GoogleSignInButton />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.register}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
