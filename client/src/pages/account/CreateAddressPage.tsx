import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { PageContainer } from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import {
  AddressForm,
  toAddressRequest,
  useCreateAddress,
  type AddressFormValues,
} from '@/features/addresses'
import { ROUTES } from '@/utils/routes'

export function CreateAddressPage() {
  const navigate = useNavigate()
  const [createAddress, { isLoading }] = useCreateAddress()

  const handleSubmit = async (values: AddressFormValues) => {
    await createAddress(toAddressRequest(values))
    navigate(ROUTES.addresses, { replace: true })
  }

  return (
    <PageContainer>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.addresses}>
          <ArrowLeft className="size-4" />
          Back to addresses
        </Link>
      </Button>

      <h1 className="mb-6 font-heading text-2xl font-semibold">Add address</h1>

      <div className="max-w-xl">
        <AddressForm
          submitLabel="Add address"
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </PageContainer>
  )
}
