import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useRejectMerchantOrder } from '../hooks'

interface RejectOrderDialogProps {
  open: boolean
  onClose: () => void
  orderId: string
}

export function RejectOrderDialog({ open, onClose, orderId }: RejectOrderDialogProps) {
  const [reason, setReason] = useState('')
  const [rejectOrder, { isLoading }] = useRejectMerchantOrder()

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const handleSubmit = async () => {
    if (reason.trim().length < 3) return
    try {
      await rejectOrder(orderId, reason.trim())
      handleClose()
    } catch {
      // toast in hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Reason</Label>
            <Input
              id="rejectReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="At least 3 characters..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading || reason.trim().length < 3}
            onClick={() => void handleSubmit()}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Reject order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
