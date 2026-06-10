import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { useRejectMerchant } from '../hooks'

interface RejectMerchantDialogProps {
  open: boolean
  onClose: () => void
  merchantId: string
  merchantName: string
}

export function RejectMerchantDialog({
  open,
  onClose,
  merchantId,
  merchantName,
}: RejectMerchantDialogProps) {
  const [reason, setReason] = useState('')
  const [rejectMerchant, { isLoading }] = useRejectMerchant()

  if (!open) return null

  const handleSubmit = async () => {
    try {
      await rejectMerchant(merchantId, reason.trim() || undefined)
      setReason('')
      onClose()
    } catch {
      // toast in hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Reject merchant application</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Reject the application from &quot;{merchantName}&quot;? They will not be able to sell on
          ShopKart.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectMerchantReason">Reason (optional)</Label>
            <textarea
              id="rejectMerchantReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this application was rejected..."
              maxLength={500}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject application'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
