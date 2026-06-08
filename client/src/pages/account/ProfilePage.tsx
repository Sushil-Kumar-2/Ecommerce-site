import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { TextFormField } from '@/components/forms/FormField'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  updateProfileSchema,
  useProfile,
  useUpdateAvatar,
  useUpdateProfile,
  type UpdateProfileFormValues,
} from '@/features/profile'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function ProfilePageSkeleton() {
  return (
    <div className="max-w-xl space-y-6">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfilePage() {
  const { data: profile, error, isLoading, refetch } = useProfile()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfile()
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatar()
  const [avatarUrl, setAvatarUrl] = useState('')

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
      })
      setAvatarUrl(profile.avatar ?? '')
    }
  }, [profile, form])

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile({
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
    })
  })

  const handleAvatarSave = async () => {
    if (!avatarUrl.trim()) return
    await updateAvatar({ avatar: avatarUrl.trim() })
  }

  if (isLoading) {
    return (
      <PageContainer>
        <h1 className="mb-6 font-heading text-2xl font-semibold">Profile</h1>
        <ProfilePageSkeleton />
      </PageContainer>
    )
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <h1 className="mb-6 font-heading text-2xl font-semibold">Profile</h1>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load profile.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Profile</h1>

      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Paste an image URL for your profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={profile.name} /> : null}
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <Button
              variant="outline"
              disabled={isUpdatingAvatar || !avatarUrl.trim()}
              onClick={() => void handleAvatarSave()}
            >
              {isUpdatingAvatar ? <Loader2 className="animate-spin" /> : 'Save avatar'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <TextFormField control={form.control} name="name" label="Name" />
                <TextFormField
                  control={form.control}
                  name="email"
                  label="Email"
                  type="email"
                />
                <TextFormField
                  control={form.control}
                  name="phone"
                  label="Phone"
                  type="tel"
                />
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Button variant="outline" asChild>
          <Link to={ROUTES.changePassword}>
            <KeyRound />
            Change password
          </Link>
        </Button>
      </div>
    </PageContainer>
  )
}
