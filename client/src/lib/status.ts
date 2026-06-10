export type StatusVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'pending'
  | 'destructive'
  | 'neutral'

const ORDER_STATUS_MAP: Record<string, StatusVariant> = {
  delivered: 'success',
  paid: 'success',
  approved: 'success',
  active: 'success',
  resolved: 'success',
  shipped: 'info',
  out_for_delivery: 'info',
  accepted: 'info',
  ready: 'info',
  reviewed: 'info',
  pending: 'pending',
  processing: 'pending',
  placed: 'pending',
  cancelled: 'destructive',
  rejected: 'destructive',
  failed: 'destructive',
  blocked: 'destructive',
  inactive: 'neutral',
  disabled: 'neutral',
}

export function getStatusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase().replace(/\s+/g, '_')
  return ORDER_STATUS_MAP[normalized] ?? 'neutral'
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
