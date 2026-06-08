import { MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/features/addresses'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

function AddressesPageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function AddressesPage() {
  const { data: addresses = [], error, isLoading, refetch } = useAddresses()
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddress()
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddress()

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">My Addresses</h1>
        </div>
        <AddressesPageSkeleton />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <h1 className="mb-6 font-heading text-2xl font-semibold">My Addresses</h1>
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load addresses.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">My Addresses</h1>
        <Button asChild>
          <Link to={ROUTES.addressNew}>
            <Plus />
            Add address
          </Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No addresses saved"
          description="Add a shipping address to complete checkout."
          action={
            <Button asChild>
              <Link to={ROUTES.addressNew}>Add address</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <article
              key={address._id}
              className="rounded-xl border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{address.fullName}</p>
                    {address.isDefault ? (
                      <Badge variant="secondary">Default</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.pincode}, {address.country}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSettingDefault}
                      onClick={() => void setDefaultAddress(address._id)}
                    >
                      Set default
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={ROUTES.addressEdit(address._id)}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => void deleteAddress(address._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
