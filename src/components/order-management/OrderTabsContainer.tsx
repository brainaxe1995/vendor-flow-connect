
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { getStatusColor, getTrackingNumber } from '../../utils/orderUtils';
import OrderTabsHeader from './OrderTabsHeader';
import OrderTabContent from './OrderTabContent';

interface OrderTabsContainerProps {
  ordersByStatus: {
    pending: any[];
    processing: any[];
    inTransit: any[];
    onHold: any[];
    completed: any[];
    cancelled: any[];
    refunded: any[];
    failed: any[];
    pendingPayment: any[];
  };
  queries: {
    pending: any;
    processing: any;
    onHold: any;
    inTransit: any;
    completed: any;
    cancelled: any;
    refunded: any;
    failed: any;
    pendingPayment: any;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditOrder: (order: any) => void;
}

const OrderTabsContainer: React.FC<OrderTabsContainerProps> = ({
  ordersByStatus,
  queries,
  currentPage,
  onPageChange,
  onEditOrder,
}) => {
  // Order counts for tabs
  const orderCounts = {
    pending: queries.pending.data?.totalRecords || 0,
    processing: queries.processing.data?.totalRecords || 0,
    inTransit: queries.inTransit.data?.totalRecords || 0,
    onHold: queries.onHold.data?.totalRecords || 0,
    completed: queries.completed.data?.totalRecords || 0,
    cancelled: queries.cancelled.data?.totalRecords || 0,
    refunded: queries.refunded.data?.totalRecords || 0,
    failed: queries.failed.data?.totalRecords || 0,
    pendingPayment: queries.pendingPayment.data?.totalRecords || 0
  };

  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <OrderTabsHeader orderCounts={orderCounts} />

      <OrderTabContent
        value="pending"
        title="Pending Orders"
        description="Orders waiting to be processed"
        orders={ordersByStatus.pending}
        isLoading={queries.pending.isLoading}
        totalPages={queries.pending.data?.totalPages || 1}
        totalRecords={queries.pending.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="processing"
        title="Processing Orders"
        description="Orders currently being prepared"
        orders={ordersByStatus.processing}
        isLoading={queries.processing.isLoading}
        showTracking={true}
        totalPages={queries.processing.data?.totalPages || 1}
        totalRecords={queries.processing.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="in-transit"
        title="In Transit Orders"
        description="Orders with tracking numbers that are shipped"
        orders={ordersByStatus.inTransit}
        isLoading={queries.inTransit.isLoading}
        showTracking={true}
        totalPages={queries.inTransit.data?.totalPages || 1}
        totalRecords={queries.inTransit.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="on-hold"
        title="Orders On Hold"
        description="Orders that require attention"
        orders={ordersByStatus.onHold}
        isLoading={queries.onHold.isLoading}
        totalPages={queries.onHold.data?.totalPages || 1}
        totalRecords={queries.onHold.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="completed"
        title="Completed Orders"
        description="Successfully fulfilled orders"
        orders={ordersByStatus.completed}
        isLoading={queries.completed.isLoading}
        showTracking={true}
        totalPages={queries.completed.data?.totalPages || 1}
        totalRecords={queries.completed.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="cancelled"
        title="Cancelled Orders"
        description="Orders that have been cancelled"
        orders={ordersByStatus.cancelled}
        isLoading={queries.cancelled.isLoading}
        totalPages={queries.cancelled.data?.totalPages || 1}
        totalRecords={queries.cancelled.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="refunded"
        title="Refunded Orders"
        description="Orders that have been refunded"
        orders={ordersByStatus.refunded}
        isLoading={queries.refunded.isLoading}
        totalPages={queries.refunded.data?.totalPages || 1}
        totalRecords={queries.refunded.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="failed"
        title="Failed Orders"
        description="Orders that have failed processing"
        orders={ordersByStatus.failed}
        isLoading={queries.failed.isLoading}
        totalPages={queries.failed.data?.totalPages || 1}
        totalRecords={queries.failed.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />

      <OrderTabContent
        value="pending-payment"
        title="Pending Payment"
        description="Orders waiting for payment"
        orders={ordersByStatus.pendingPayment}
        isLoading={queries.pendingPayment.isLoading}
        totalPages={queries.pendingPayment.data?.totalPages || 1}
        totalRecords={queries.pendingPayment.data?.totalRecords}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onEditOrder={onEditOrder}
        getStatusColor={getStatusColor}
        getTrackingNumber={getTrackingNumber}
      />
    </Tabs>
  );
};

export default OrderTabsContainer;
