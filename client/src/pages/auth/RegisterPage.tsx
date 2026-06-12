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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
      phone: '',
      accountType: 'customer',
    },
  })

  const accountType = form.watch('accountType')

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
              <div className="space-y-2">
                <Label>I want to</Label>
                <RadioGroup
                  value={accountType}
                  onValueChange={(value: 'customer' | 'merchant') =>
                    form.setValue('accountType', value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="customer" id="account-customer" />
                    <Label htmlFor="account-customer" className="font-normal">
                      Shop as customer
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="merchant" id="account-merchant" />
                    <Label htmlFor="account-merchant" className="font-normal">
                      Sell as merchant
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {accountType === 'customer' ? (
                <>
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
                    name="phone"
                    label="Phone (optional)"
                    placeholder="+91 9876543210"
                    autoComplete="tel"
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
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Continue to the seller application to provide your shop and business details.
                </p>
              )}

              <Button
                type={accountType === 'merchant' ? 'button' : 'submit'}
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
                onClick={
                  accountType === 'merchant'
                    ? () => navigate(ROUTES.becomeASeller)
                    : undefined
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating account...
                  </>
                ) : accountType === 'merchant' ? (
                  'Continue to seller application'
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
