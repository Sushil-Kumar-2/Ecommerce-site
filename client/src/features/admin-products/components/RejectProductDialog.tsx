import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { useRejectProduct } from '../hooks'

interface RejectProductDialogProps {
  open: boolean
  onClose: () => void
  productId: string
}

export function RejectProductDialog({
  open,
  onClose,
  productId,
}: RejectProductDialogProps) {
  const [reason, setReason] = useState('')
  const [rejectProduct, { isLoading }] = useRejectProduct()

  if (!open) return null

  const handleSubmit = async () => {
    try {
      await rejectProduct(productId, reason.trim() || undefined)
      setReason('')
      onClose()
    } catch {
      // toast in hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Reject product</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Reason (optional)</Label>
            <textarea
              id="rejectReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this product was rejected..."
              maxLength={500}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={() => void handleSubmit()}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Reject product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
