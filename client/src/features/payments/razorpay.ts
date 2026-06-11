import type {
  RazorpayCheckoutOptions,
  RazorpayFailedResponse,
  RazorpaySuccessResponse,
} from './payment.types'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve()
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
    document.body.appendChild(script)
  })

  return scriptPromise
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      ...options,
      handler: (response: RazorpaySuccessResponse) => {
        options.handler(response)
        resolve(response)
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          options.modal?.ondismiss?.()
          reject(new Error('Payment cancelled'))
        },
      },
    })

    checkout.on('payment.failed', (response: unknown) => {
      const failed = response as RazorpayFailedResponse
      const description =
        failed.error?.description ?? 'Payment failed. Please try again.'
      reject(new Error(description))
    })

    checkout.open()
  })
}
