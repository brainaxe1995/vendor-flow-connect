
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import OrderTable from './OrderTable';

interface OrderTabContentProps {
  value: string;
  title: string;
  description: string;
  orders: any[];
  isLoading: boolean;
  showTracking?: boolean;
  totalPages: number;
  totalRecords?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditOrder: (order: any) => void;
  getStatusColor: (status: string) => string;
  getTrackingNumber: (order: any) => string | null;
}

const OrderTabContent: React.FC<OrderTabContentProps> = ({
  value,
  title,
  description,
  orders,
  isLoading,
  showTracking = false,
  totalPages,
  totalRecords,
  currentPage,
  onPageChange,
  onEditOrder,
  getStatusColor,
  getTrackingNumber,
}) => {
  const finalDescription = totalRecords 
    ? `${description} • ${totalRecords} total records`
    : description;

  return (
    <TabsContent value={value}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{finalDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable 
            orders={orders} 
            isLoading={isLoading} 
            showTracking={showTracking}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onEditOrder={onEditOrder}
            getStatusColor={getStatusColor}
            getTrackingNumber={getTrackingNumber}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default OrderTabContent;
