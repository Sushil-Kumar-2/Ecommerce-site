import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AddressForm,
  toAddressRequest,
  useAddress,
  useUpdateAddress,
  type AddressFormValues,
} from '@/features/addresses'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function EditAddressPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: address, error, isLoading, refetch } = useAddress(id)
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddress()

  const handleSubmit = async (values: AddressFormValues) => {
    if (!id) return
    await updateAddress(id, toAddressRequest(values))
    navigate(ROUTES.addresses, { replace: true })
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="mb-6 h-9 w-40" />
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-96 max-w-xl rounded-xl" />
      </PageContainer>
    )
  }

  if (error || !address) {
    return (
      <PageContainer>
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.addresses}>
            <ArrowLeft className="size-4" />
            Back to addresses
          </Link>
        </Button>
        <ErrorState
          message={getApiErrorMessage(error, 'Address not found.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.addresses}>
          <ArrowLeft className="size-4" />
          Back to addresses
        </Link>
      </Button>

      <h1 className="mb-6 font-heading text-2xl font-semibold">Edit address</h1>

      <div className="max-w-xl">
        <AddressForm
          defaultValues={{
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 ?? '',
            city: address.city,
            state: address.state,
            country: address.country,
            pincode: address.pincode,
            landmark: address.landmark ?? '',
            isDefault: address.isDefault,
          }}
          submitLabel="Save changes"
          isLoading={isUpdating}
          onSubmit={handleSubmit}
        />
      </div>
    </PageContainer>
  )
}
