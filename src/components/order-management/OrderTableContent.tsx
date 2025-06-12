
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody } from '@/components/ui/table';
import OrderTableHeader from './OrderTableHeader';
import OrderTableRow from './OrderTableRow';

interface OrderTableContentProps {
  orders: any[];
  isLoading: boolean;
  showTracking?: boolean;
  onEditOrder: (order: any) => void;
  getStatusColor: (status: string) => string;
  getTrackingNumber: (order: any) => string | null;
  error?: any;
}

const OrderTableContent: React.FC<OrderTableContentProps> = ({
  orders,
  isLoading,
  showTracking = false,
  onEditOrder,
  getStatusColor,
  getTrackingNumber,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders: {error.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No orders found</p>
        <p className="text-sm mt-2">Try refreshing or checking your WooCommerce configuration</p>
      </div>
    );
  }

  console.log('Rendering OrderTableContent with orders:', orders.length);

  return (
    <Table>
      <OrderTableHeader showTracking={showTracking} />
      <TableBody>
        {orders.map((order) => (
          <OrderTableRow
            key={order.id}
            order={order}
            showTracking={showTracking}
            onEditOrder={onEditOrder}
            getStatusColor={getStatusColor}
            getTrackingNumber={getTrackingNumber}
          />
        )).filter(Boolean)}
      </TableBody>
    </Table>
  );
};

export default OrderTableContent;
