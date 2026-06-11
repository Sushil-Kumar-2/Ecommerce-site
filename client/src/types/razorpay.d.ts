interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: (response: unknown) => void) => void
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor
  }
}

export {}
