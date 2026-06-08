import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ProductForm,
  useMerchantProduct,
  useUpdateProduct,
  type MerchantProductFormValues,
} from '@/features/merchant-products'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, error, isLoading, refetch } = useMerchantProduct(id)
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProduct()

  const handleSubmit = async (values: MerchantProductFormValues) => {
    if (!id) return
    await updateProduct(id, {
      title: values.title,
      slug: values.slug,
      description: values.description,
      categoryId: values.categoryId,
      price: values.price,
      discountPrice:
        values.discountPrice === '' || values.discountPrice === undefined
          ? undefined
          : Number(values.discountPrice),
      stock: values.stock,
      images: values.images,
    })
    navigate(ROUTES.merchantProducts, { replace: true })
  }

  if (isLoading) {
    return (
      <PageContainer title="Edit product">
        <Skeleton className="h-96 max-w-2xl rounded-xl" />
      </PageContainer>
    )
  }

  if (error || !product) {
    return (
      <PageContainer title="Edit product">
        <ErrorState
          message={getApiErrorMessage(error, 'Product not found.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Edit product">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.merchantProducts}>
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>

      <div className="mb-4">
        <Badge variant="outline">Status: {product.status}</Badge>
      </div>

      <div className="max-w-2xl">
        <ProductForm
          defaultValues={{
            title: product.title,
            slug: product.slug,
            description: product.description,
            categoryId: product.categoryId,
            price: product.price,
            discountPrice: product.discountPrice || '',
            stock: product.stock,
            images: product.images,
          }}
          submitLabel="Save changes"
          isLoading={isUpdating}
          onSubmit={handleSubmit}
        />
      </div>
    </PageContainer>
  )
}
