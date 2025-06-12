
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Eye, Edit } from 'lucide-react';

interface OrderTableRowProps {
  order: any;
  showTracking?: boolean;
  onEditOrder: (order: any) => void;
  getStatusColor: (status: string) => string;
  getTrackingNumber: (order: any) => string | null;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({
  order,
  showTracking = false,
  onEditOrder,
  getStatusColor,
  getTrackingNumber,
}) => {
  // Add validation for order object and its properties
  if (!order || !order.id) {
    console.warn('Invalid order object:', order);
    return null;
  }

  const tracking = getTrackingNumber(order);
  const billing = order.billing || {};
  const lineItems = order.line_items || [];

  return (
    <TableRow key={order.id}>
      <TableCell className="font-medium">#{order.id}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">
            {billing.first_name || ''} {billing.last_name || ''}
          </p>
          <p className="text-sm text-muted-foreground">
            {billing.email || 'No email'}
          </p>
        </div>
      </TableCell>
      <TableCell>{Array.isArray(lineItems) ? lineItems.length : 0}</TableCell>
      <TableCell>${order.total || '0.00'}</TableCell>
      <TableCell>
        {order.date_created ? new Date(order.date_created).toLocaleDateString() : 'N/A'}
      </TableCell>
      {showTracking && (
        <TableCell>
          {tracking ? (
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{tracking}</code>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
      <TableCell>
        <Badge className={getStatusColor(order.status || 'unknown')}>
          {(order.status || 'unknown').replace('-', ' ')}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" title="View Order">
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEditOrder(order)}
            title="Edit Order"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
