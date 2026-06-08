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

import { useShipMerchantOrder } from '../hooks'

interface ShipOrderDialogProps {
  open: boolean
  onClose: () => void
  orderId: string
}

export function ShipOrderDialog({ open, onClose, orderId }: ShipOrderDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [shipOrder, { isLoading }] = useShipMerchantOrder()

  const handleClose = () => {
    setTrackingNumber('')
    setCarrier('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) return
    try {
      await shipOrder(orderId, trackingNumber.trim(), carrier.trim() || undefined)
      handleClose()
    } catch {
      // toast in hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ship order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking number</Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier (optional)</Label>
            <Input
              id="carrier"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              placeholder="e.g. FedEx, DHL"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            disabled={isLoading || !trackingNumber.trim()}
            onClick={() => void handleSubmit()}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Ship order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
