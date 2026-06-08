import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { TextFormField } from '@/components/forms/FormField'
import { PageContainer } from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import {
  changePasswordSchema,
  useChangePassword,
  type ChangePasswordFormValues,
} from '@/features/profile'
import { ROUTES } from '@/utils/routes'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [changePassword, { isLoading }] = useChangePassword()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
    navigate(ROUTES.profile, { replace: true })
  })

  return (
    <PageContainer>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.profile}>
          <ArrowLeft className="size-4" />
          Back to profile
        </Link>
      </Button>

      <h1 className="mb-6 font-heading text-2xl font-semibold">Change password</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Update password</CardTitle>
          <CardDescription>
            Enter your current password and choose a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <TextFormField
                control={form.control}
                name="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
              />
              <TextFormField
                control={form.control}
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
              />
              <TextFormField
                control={form.control}
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
