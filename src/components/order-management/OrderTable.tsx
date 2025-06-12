
import React from 'react';
import OrderTableContent from './OrderTableContent';
import OrderTablePagination from './OrderTablePagination';

interface OrderTableProps {
  orders: any[];
  isLoading: boolean;
  showTracking?: boolean;
  totalPages?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditOrder: (order: any) => void;
  getStatusColor: (status: string) => string;
  getTrackingNumber: (order: any) => string | null;
  error?: any;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  showTracking = false,
  totalPages = 1,
  currentPage,
  onPageChange,
  onEditOrder,
  getStatusColor,
  getTrackingNumber,
  error,
}) => {
  return (
    <div className="space-y-4">
      <OrderTableContent
        orders={orders}
        isLoading={isLoading}
        showTracking={showTracking}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
        error={error}
      />

      <OrderTablePagination
        totalPages={totalPages}
        currentPage={currentPage}
        ordersCount={orders?.length || 0}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default OrderTable;
