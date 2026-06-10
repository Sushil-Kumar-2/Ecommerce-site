import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Heart,
  KeyRound,
  Loader2,
  MapPin,
  Package,
  Shield,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { TextFormField } from '@/components/forms/FormField'
import { ErrorState } from '@/components/common/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  updateProfileSchema,
  useProfile,
  useUpdateAvatar,
  useUpdateProfile,
  useUploadAvatar,
  type UpdateProfileFormValues,
} from '@/features/profile'
import { getInitials } from '@/lib/user'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'
import { cn } from '@/lib/utils'

const quickLinks = [
  { to: ROUTES.orders, label: 'Orders', description: 'Track purchases', icon: Package },
  { to: ROUTES.addresses, label: 'Addresses', description: 'Delivery locations', icon: MapPin },
  { to: ROUTES.wishlist, label: 'Wishlist', description: 'Saved items', icon: Heart },
] as const

function formatMemberSince(date?: string) {
  if (!date) return 'Recently joined'
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-1" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  )
}

export function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: profile, error, isLoading, refetch } = useProfile()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfile()
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatar()
  const { upload, isUploading } = useUploadAvatar()

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
      })
    }
  }, [profile, form])

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile({
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
    })
    form.reset(values)
  })

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    try {
      const url = await upload(file)
      await updateAvatar({ avatar: url })
    } catch {
      // Errors are surfaced via hooks/toasts
    }
  }

  const isAvatarBusy = isUploading || isUpdatingAvatar

  if (isLoading) {
    return <ProfilePageSkeleton />
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <ProfileHeader />
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load profile.')}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  const displayAvatar = profile.avatar ?? ''
  const displayName = profile.name?.trim() || profile.email || 'Account'

  return (
    <div className="space-y-6">
      <ProfileHeader />

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="bg-gradient-to-r from-brand-primary/10 via-background to-brand-accent/10 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <button
              type="button"
              className="group relative mx-auto size-24 shrink-0 rounded-full sm:mx-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAvatarBusy}
              aria-label="Change profile photo"
            >
              <Avatar className="size-24 border-2 border-background shadow-md">
                {displayAvatar ? (
                  <AvatarImage src={displayAvatar} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-brand-primary/10 text-xl font-semibold text-brand-primary">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
                  isAvatarBusy && 'opacity-100',
                )}
              >
                {isAvatarBusy ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Camera className="size-6" />
                )}
              </span>
            </button>

            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-heading text-xl font-semibold sm:text-2xl">{displayName}</h2>
                {profile.emailVerified ? (
                  <Badge variant="secondary" className="gap-1 bg-status-success/15 text-status-success">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 bg-status-warning/15 text-status-warning">
                    <AlertCircle className="size-3" />
                    Email not verified
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since {formatMemberSince(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleAvatarUpload(event)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile photo</CardTitle>
              <CardDescription>
                Upload a clear photo. JPG or PNG, up to 5 MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isAvatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                {isAvatarBusy ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera />
                    Change photo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map(({ to, label, description, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Icon className="size-4 text-brand-primary" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Update your name, email, and phone number.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <TextFormField control={form.control} name="name" label="Full name" />
                    </div>
                    <TextFormField
                      control={form.control}
                      name="email"
                      label="Email address"
                      type="email"
                      autoComplete="email"
                    />
                    <TextFormField
                      control={form.control}
                      name="phone"
                      label="Phone number"
                      type="tel"
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                    />
                  </div>

                  {!profile.emailVerified ? (
                    <p className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-2 text-xs text-status-warning">
                      Changing your email will require verification before it becomes active.
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={isUpdating || !form.formState.isDirty}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save changes'
                      )}
                    </Button>
                    {form.formState.isDirty ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() =>
                          form.reset({
                            name: profile.name ?? '',
                            email: profile.email ?? '',
                            phone: profile.phone ?? '',
                          })
                        }
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-4 text-brand-primary" />
                Security
              </CardTitle>
              <CardDescription>Keep your account safe with a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Use a unique password you do not use on other sites.
                </p>
              </div>
              <Button variant="outline" asChild className="shrink-0">
                <Link to={ROUTES.changePassword}>
                  <KeyRound />
                  Change password
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ProfileHeader() {
  return (
    <header className="space-y-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.home}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.account}>Account</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, profile photo, and account security.
        </p>
      </div>

      <Separator />
    </header>
  )
}
