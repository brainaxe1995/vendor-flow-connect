
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface OrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  trackingNumber: string;
  orderStatus: string;
  orderNotes: string;
  onTrackingNumberChange: (value: string) => void;
  onOrderStatusChange: (value: string) => void;
  onOrderNotesChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  getTrackingMetaKey: (order: any) => string;
}

const OrderDialog: React.FC<OrderDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
  trackingNumber,
  orderStatus,
  orderNotes,
  onTrackingNumberChange,
  onOrderStatusChange,
  onOrderNotesChange,
  onSave,
  isSaving,
  getTrackingMetaKey,
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Order #{order.id}</DialogTitle>
          <DialogDescription>
            Manage order status, tracking, and communications
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input 
                id="tracking" 
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => onTrackingNumberChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Meta key: {getTrackingMetaKey(order)}
              </p>
            </div>
            <div>
              <Label htmlFor="status">Order Status</Label>
              <Select value={orderStatus} onValueChange={onOrderStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Add notes about this order..."
              value={orderNotes}
              onChange={(e) => onOrderNotesChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
