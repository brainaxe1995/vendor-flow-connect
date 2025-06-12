
import React from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import OrderManagementHeader from '../components/order-management/OrderManagementHeader';
import OrderTabsContainer from '../components/order-management/OrderTabsContainer';
import OrderDialog from '../components/order-management/OrderDialog';

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

  // Log data for debugging
  console.log('Order Management Data:', {
    pending: { count: ordersByStatus.pending.length, totalPages: queries.pending.data?.totalPages, totalRecords: queries.pending.data?.totalRecords },
    processing: { count: ordersByStatus.processing.length, totalPages: queries.processing.data?.totalPages },
    error: queries.pending.error
  });

  return (
    <div className="p-6 space-y-6">
      <OrderManagementHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
      />

      <OrderTabsContainer
        ordersByStatus={ordersByStatus}
        queries={queries}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onEditOrder={handleEditOrder}
      />

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
