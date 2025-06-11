
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { getStatusColor, getTrackingNumber } from '../utils/orderUtils';
import OrderFilters from '../components/order-management/OrderFilters';
import OrderDialog from '../components/order-management/OrderDialog';
import OrderTabsHeader from '../components/order-management/OrderTabsHeader';
import OrderTabContent from '../components/order-management/OrderTabContent';

const OrderManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    editingOrder,
    trackingNumber,
    setTrackingNumber,
    orderStatus,
    setOrderStatus,
    orderNotes,
    setOrderNotes,
    isDialogOpen,
    setIsDialogOpen,
    ordersByStatus,
    queries,
    handleEditOrder,
    handleUpdateOrder,
    handleRefresh,
    updateOrderMutation,
    getTrackingMetaKey
  } = useOrderManagement();

  // Order counts for tabs
  const orderCounts = {
    pending: ordersByStatus.pending?.length || 0,
    processing: ordersByStatus.processing?.length || 0,
    inTransit: ordersByStatus.inTransit?.length || 0,
    onHold: ordersByStatus.onHold?.length || 0,
    completed: ordersByStatus.completed?.length || 0,
    cancelled: ordersByStatus.cancelled?.length || 0,
    refunded: ordersByStatus.refunded?.length || 0,
    failed: ordersByStatus.failed?.length || 0,
    pendingPayment: ordersByStatus.pendingPayment?.length || 0
  };

  // Log data for debugging
  console.log('Order Management Data:', {
    pending: { count: ordersByStatus.pending.length, totalPages: queries.pending.data?.totalPages, totalRecords: queries.pending.data?.totalRecords },
    processing: { count: ordersByStatus.processing.length, totalPages: queries.processing.data?.totalPages },
    error: queries.pending.error
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <OrderFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
        />
      </div>

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
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          totalRecords={ordersByStatus.inTransit.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
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
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditOrder={handleEditOrder}
          getStatusColor={getStatusColor}
          getTrackingNumber={getTrackingNumber}
        />
      </Tabs>

      <OrderDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={editingOrder}
        trackingNumber={trackingNumber}
        orderStatus={orderStatus}
        orderNotes={orderNotes}
        onTrackingNumberChange={setTrackingNumber}
        onOrderStatusChange={setOrderStatus}
        onOrderNotesChange={setOrderNotes}
        onSave={handleUpdateOrder}
        isSaving={updateOrderMutation.isPending}
        getTrackingMetaKey={getTrackingMetaKey}
      />
    </div>
  );
};

export default OrderManagement;
