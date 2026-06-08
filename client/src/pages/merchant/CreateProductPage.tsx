import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { PageContainer } from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import {
  ProductForm,
  useCreateProduct,
  type MerchantProductFormValues,
} from '@/features/merchant-products'
import { ROUTES } from '@/utils/routes'

export function CreateProductPage() {
  const navigate = useNavigate()
  const [createProduct, { isLoading }] = useCreateProduct()

  const handleSubmit = async (values: MerchantProductFormValues) => {
    await createProduct({
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

  return (
    <PageContainer title="Add product">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.merchantProducts}>
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>
      <div className="max-w-2xl">
        <ProductForm
          submitLabel="Create product"
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </PageContainer>
  )
}
