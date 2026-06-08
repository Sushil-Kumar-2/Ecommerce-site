import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/ErrorState'
import { PageContainer } from '@/components/common/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RejectProductDialog,
  useAdminProduct,
  useApproveProduct,
  useFeatureProduct,
  useUnfeatureProduct,
} from '@/features/admin-products'
import { formatPrice } from '@/features/products/utils'
import { getApiErrorMessage } from '@/utils/api-error'
import { ROUTES } from '@/utils/routes'

export function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, error, isLoading, refetch } = useAdminProduct(id)
  const [approveProduct, { isLoading: isApproving }] = useApproveProduct()
  const [featureProduct, { isLoading: isFeaturing }] = useFeatureProduct()
  const [unfeatureProduct, { isLoading: isUnfeaturing }] = useUnfeatureProduct()
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  if (error || (!isLoading && !product)) {
    return (
      <PageContainer title="Product detail">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.adminProducts}>
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </Button>
        <ErrorState
          message={getApiErrorMessage(error, 'Product not found.')}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    )
  }

  if (!product) {
    return (
      <PageContainer title="Product detail">
        <Skeleton className="mb-6 h-10 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </PageContainer>
    )
  }

  const category =
    typeof product.categoryId === 'object' ? product.categoryId : null
  const merchant =
    typeof product.merchantId === 'object' ? product.merchantId : null
  const canApprove = product.status === 'pending' || product.status === 'rejected'
  const canReject = product.status === 'pending' || product.status === 'approved'
  const canFeature = product.status === 'approved' && !product.featured
  const canUnfeature = product.featured

  return (
    <PageContainer title={product.title}>
      <Button asChild variant="ghost" className="mb-6">
        <Link to={ROUTES.adminProducts}>
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline">{product.status}</Badge>
        {product.featured ? <Badge variant="secondary">Featured</Badge> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {product.images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {product.images.map((image) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className="size-24 rounded-lg border object-cover"
                />
              ))}
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{product.description}</p>
              <p>
                <span className="text-muted-foreground">Price:</span>{' '}
                {formatPrice(product.discountPrice || product.price)}
                {product.discountPrice ? (
                  <span className="ml-2 text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                ) : null}
              </p>
              <p>
                <span className="text-muted-foreground">Stock:</span> {product.stock}
              </p>
              <p>
                <span className="text-muted-foreground">Rating:</span>{' '}
                {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
              </p>
              {category ? (
                <p>
                  <span className="text-muted-foreground">Category:</span>{' '}
                  {category.name}
                </p>
              ) : null}
              {merchant ? (
                <p>
                  <span className="text-muted-foreground">Merchant:</span>{' '}
                  <Link
                    to={ROUTES.adminMerchantDetail(merchant._id)}
                    className="hover:underline"
                  >
                    {merchant.shopName || merchant.name}
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-2">
          {canApprove ? (
            <Button
              disabled={isApproving}
              onClick={() => id && void approveProduct(id)}
            >
              Approve product
            </Button>
          ) : null}
          {canReject ? (
            <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
              Reject product
            </Button>
          ) : null}
          {canFeature ? (
            <Button
              variant="secondary"
              disabled={isFeaturing}
              onClick={() => id && void featureProduct(id)}
            >
              Feature product
            </Button>
          ) : null}
          {canUnfeature ? (
            <Button
              variant="outline"
              disabled={isUnfeaturing}
              onClick={() => id && void unfeatureProduct(id)}
            >
              Unfeature product
            </Button>
          ) : null}
        </aside>
      </div>

      {id ? (
        <RejectProductDialog
          open={showRejectDialog}
          onClose={() => setShowRejectDialog(false)}
          productId={id}
        />
      ) : null}
    </PageContainer>
  )
}
