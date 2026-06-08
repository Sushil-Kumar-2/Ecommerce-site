import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
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
  registerSchema,
  toRegisterRequest,
  useRegisterMutation,
  type RegisterFormValues,
} from '@/features/auth'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function RegisterPage() {
  const navigate = useNavigate()
  const [registerUser, { isLoading }] = useRegisterMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerUser(toRegisterRequest(values)).unwrap()
      toast.success('Account created. Please sign in.')
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to register.'))
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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with ShopKart.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <TextFormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Jane Doe"
                autoComplete="name"
              />
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
                autoComplete="new-password"
              />
              <TextFormField
                control={form.control}
                name="confirmPassword"
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to={ROUTES.login}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
