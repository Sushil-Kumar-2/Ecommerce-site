import { CheckCircle2 } from 'lucide-react'
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

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <PageContainer centered>
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>
          <CardTitle>Payment successful</CardTitle>
          <CardDescription>
            Your payment has been verified and your order is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orderId ? (
            <Button asChild>
              <Link to={ROUTES.orderDetail(orderId)}>View order</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link to={ROUTES.orders}>My orders</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to={ROUTES.home}>Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
