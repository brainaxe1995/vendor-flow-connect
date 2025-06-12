
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Eye } from 'lucide-react';
import { getTrackingNumber } from '@/utils/orderUtils';

interface ShipmentTableProps {
  orders: any[];
  isLoading: boolean;
  showAddTracking?: boolean;
  showTracking?: boolean;
  trackingInputs: Record<number, string>;
  updatingOrderId: number | null;
  onTrackingInputChange: (orderId: number, value: string) => void;
  onAddTracking: (orderId: number) => void;
  onViewTracking?: (orderId: number, trackingNumber: string) => void;
  getShipmentStatus: (order: any) => { status: string; color: string };
}

const ShipmentTable: React.FC<ShipmentTableProps> = ({
  orders,
  isLoading,
  showAddTracking = false,
  showTracking = false,
  trackingInputs,
  updatingOrderId,
  onTrackingInputChange,
  onAddTracking,
  onViewTracking,
  getShipmentStatus,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading shipments...</span>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No shipments found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Tracking Number</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          {(showAddTracking || showTracking) && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const tracking = getTrackingNumber(order);
          const shipmentStatus = getShipmentStatus(order);
          const isUpdating = updatingOrderId === order.id;

          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                  <p className="text-sm text-muted-foreground">{order.billing.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{order.shipping.address_1}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
                  <p>{order.shipping.country}</p>
                </div>
              </TableCell>
              <TableCell>
                {tracking ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded">{tracking}</code>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={shipmentStatus.color}>
                  {shipmentStatus.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
              {(showAddTracking || showTracking) && (
                <TableCell>
                  <div className="flex gap-2">
                    {showAddTracking && !tracking && (
                      <>
                        <Input
                          placeholder="Tracking number"
                          value={trackingInputs[order.id] || ''}
                          onChange={(e) => onTrackingInputChange(order.id, e.target.value)}
                          className="w-32 text-xs"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => onAddTracking(order.id)}
                          disabled={isUpdating || !trackingInputs[order.id]?.trim()}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Add'
                          )}
                        </Button>
                      </>
                    )}
                    {showTracking && tracking && onViewTracking && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewTracking(order.id, tracking)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Track
                      </Button>
                    )}
                    {tracking && (
                      <span className="text-sm text-green-600 flex items-center">
                        ✓ Shipped
                      </span>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ShipmentTable;
