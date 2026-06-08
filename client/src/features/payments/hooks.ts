import { toast } from 'sonner'

import { getApiErrorMessage } from '@/utils/api-error'

import {
  useCreateRazorpayOrderMutation,
  useMarkPaymentFailedMutation,
  useVerifyPaymentMutation,
} from './paymentsApi'
import { openRazorpayCheckout } from './razorpay'

export function useRazorpayPayment() {
  const [createRazorpayOrder, { isLoading: isCreating }] =
    useCreateRazorpayOrderMutation()
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation()
  const [markPaymentFailed, { isLoading: isMarkingFailed }] =
    useMarkPaymentFailedMutation()

  const pay = async (orderId: string, userEmail?: string) => {
    try {
      const razorpayOrder = await createRazorpayOrder(orderId).unwrap()

      const response = await openRazorpayCheckout({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Ecommerce',
        description: 'Order payment',
        order_id: razorpayOrder.razorpayOrderId,
        prefill: userEmail ? { email: userEmail } : undefined,
        theme: { color: '#18181b' },
        handler: () => {},
      })

      const result = await verifyPayment({
        orderId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      }).unwrap()

      toast.success(result.message)
      return result
    } catch (error) {
      try {
        await markPaymentFailed(orderId).unwrap()
      } catch {
        // ignore secondary failure
      }

      if (error instanceof Error && error.message === 'Payment cancelled') {
        toast.error('Payment cancelled')
      } else {
        toast.error(getApiErrorMessage(error, 'Payment failed.'))
      }

      throw error
    }
  }

  return {
    pay,
    isLoading: isCreating || isVerifying || isMarkingFailed,
  }
}
