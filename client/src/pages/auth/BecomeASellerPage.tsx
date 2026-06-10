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
import { Textarea } from '@/components/ui/textarea'
import {
  becomeSellerSchema,
  toRegisterMerchantRequest,
  useRegisterMerchantMutation,
  type BecomeSellerFormValues,
} from '@/features/seller-onboarding'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function BecomeASellerPage() {
  const navigate = useNavigate()
  const [registerMerchant, { isLoading }] = useRegisterMerchantMutation()

  const form = useForm<BecomeSellerFormValues>({
    resolver: zodResolver(becomeSellerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      shopName: '',
      shopDescription: '',
      businessAddress: '',
      gstNumber: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMerchant(toRegisterMerchantRequest(values)).unwrap()
      toast.success('Application submitted. You will be notified after admin approval.')
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to submit application.'))
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
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Become a seller</CardTitle>
          <CardDescription>
            Apply to sell on ShopKart. Your application will be reviewed by our team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <TextFormField
                control={form.control}
                name="name"
                label="Full name"
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
                label="Phone"
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
              <TextFormField
                control={form.control}
                name="shopName"
                label="Shop name"
                placeholder="My Awesome Store"
              />
              <div className="space-y-2">
                <label htmlFor="shopDescription" className="text-sm font-medium">
                  Shop description
                </label>
                <Textarea
                  id="shopDescription"
                  placeholder="Tell customers what you sell..."
                  rows={3}
                  {...form.register('shopDescription')}
                />
                {form.formState.errors.shopDescription ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shopDescription.message}
                  </p>
                ) : null}
              </div>
              <TextFormField
                control={form.control}
                name="gstNumber"
                label="GST number (optional)"
                placeholder="22AAAAA0000A1Z5"
              />
              <div className="space-y-2">
                <label htmlFor="businessAddress" className="text-sm font-medium">
                  Business address
                </label>
                <Textarea
                  id="businessAddress"
                  placeholder="Street, city, state, pincode"
                  rows={2}
                  {...form.register('businessAddress')}
                />
                {form.formState.errors.businessAddress ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.businessAddress.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Submitting application...
                  </>
                ) : (
                  'Submit application'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to={ROUTES.login}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Shopping instead?{' '}
            <Link
              to={ROUTES.register}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create customer account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
