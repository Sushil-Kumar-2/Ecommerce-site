import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { OrderItem } from '../order.types'
import { useCreateReturn } from '../hooks'

interface ReturnRequestDialogProps {
  open: boolean
  onClose: () => void
  orderId: string
  items: OrderItem[]
}

export function ReturnRequestDialog({
  open,
  onClose,
  orderId,
  items,
}: ReturnRequestDialogProps) {
  const [productId, setProductId] = useState(items[0]?.productId ?? '')
  const [reason, setReason] = useState('')
  const [requestReturn, { isLoading }] = useCreateReturn()

  if (!open) return null

  const handleSubmit = async () => {
    if (!productId || reason.trim().length < 3) return

    try {
      await requestReturn({
        orderId,
        productId,
        reason: reason.trim(),
      })
      setReason('')
      onClose()
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Request return</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="returnProduct">Product</Label>
            <select
              id="returnProduct"
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              {items.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.title} × {item.quantity}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnReason">Reason</Label>
            <Input
              id="returnReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe the issue..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              disabled={isLoading || reason.trim().length < 3}
              onClick={() => void handleSubmit()}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Submit request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
