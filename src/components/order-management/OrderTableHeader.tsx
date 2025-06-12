
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrderTableHeaderProps {
  showTracking?: boolean;
}

const OrderTableHeader: React.FC<OrderTableHeaderProps> = ({ showTracking = false }) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Order ID</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Items</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Date</TableHead>
        {showTracking && <TableHead>Tracking</TableHead>}
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default OrderTableHeader;
