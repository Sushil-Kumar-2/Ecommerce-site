import { XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { PageContainer } from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ROUTES } from '@/utils/routes'

export function PaymentFailedPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <PageContainer centered>
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-8" />
          </div>
          <CardTitle>Payment failed</CardTitle>
          <CardDescription>
            Your payment could not be completed. You can retry from your order details.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orderId ? (
            <Button asChild>
              <Link to={ROUTES.orderDetail(orderId)}>View order</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link to={ROUTES.checkout}>Back to checkout</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to={ROUTES.home}>Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
