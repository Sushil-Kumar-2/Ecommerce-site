import type { Order, OrderStatusStep } from './order.types'
import { OrderStatus } from './order.types'

const STATUS_ORDER = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
] as const

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Cash on delivery',
  razorpay: 'Razorpay',
  stripe: 'Stripe',
}

function getTimestampForStatus(order: Order, status: string): string | undefined {
  switch (status) {
    case OrderStatus.PENDING:
    case OrderStatus.CONFIRMED:
      return order.createdAt
    case OrderStatus.SHIPPED:
      return order.shippedAt
    case OrderStatus.OUT_FOR_DELIVERY:
      return order.outForDeliveryAt
    case OrderStatus.DELIVERED:
      return order.deliveredAt
    case OrderStatus.CANCELLED:
      return order.cancelledAt
    default:
      return undefined
  }
}

export function getOrderStatusSteps(order: Order): OrderStatusStep[] {
  if (order.orderStatus === OrderStatus.CANCELLED) {
    return [
      {
        key: 'placed',
        label: 'Order placed',
        completed: true,
        current: false,
        timestamp: order.createdAt,
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        completed: true,
        current: true,
        timestamp: order.cancelledAt,
      },
    ]
  }

  const currentIndex = STATUS_ORDER.indexOf(
    order.orderStatus as (typeof STATUS_ORDER)[number],
  )
  const activeIndex = currentIndex >= 0 ? currentIndex : 0

  return STATUS_ORDER.map((status, index) => ({
    key: status,
    label: ORDER_STATUS_LABELS[status] ?? status,
    completed: index <= activeIndex,
    current: index === activeIndex,
    timestamp: getTimestampForStatus(order, status),
  }))
}

export function canCancelOrder(order: Order): boolean {
  const nonCancellable: string[] = [
    OrderStatus.SHIPPED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ]
  return !nonCancellable.includes(order.orderStatus)
}

export function canRequestReturn(order: Order): boolean {
  return (
    order.orderStatus === OrderStatus.DELIVERED &&
    order.paymentStatus === 'paid'
  )
}

export function canRetryPayment(order: Order): boolean {
  return (
    order.paymentMethod === 'razorpay' &&
    order.orderStatus === OrderStatus.PENDING &&
    (order.paymentStatus === 'failed' || order.paymentStatus === 'pending')
  )
}

export function getRetryPaymentLabel(order: Order): string {
  return order.paymentStatus === 'failed' ? 'Retry payment' : 'Pay now'
}

export function formatOrderDate(date?: string): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatStatusLabel(status: string): string {
  return (
    ORDER_STATUS_LABELS[status] ??
    PAYMENT_STATUS_LABELS[status] ??
    PAYMENT_METHOD_LABELS[status] ??
    status.replace(/_/g, ' ')
  )
}
