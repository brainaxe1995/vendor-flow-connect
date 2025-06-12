
import { useState } from 'react';
import { toast } from 'sonner';
import { useOrderQueries } from './useOrderQueries';
import { useOrderDialog } from './useOrderDialog';
import { useOrderActions } from './useOrderActions';

export const useOrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Use the smaller, focused hooks
  const { ordersByStatus, queries, handleRefresh } = useOrderQueries(searchTerm, currentPage);
  
  const {
    editingOrder,
    trackingNumber,
    setTrackingNumber,
    orderStatus,
    setOrderStatus,
    orderNotes,
    setOrderNotes,
    isDialogOpen,
    setIsDialogOpen,
    handleEditOrder,
    resetDialog
  } = useOrderDialog();

  const {
    handleUpdateOrder: updateOrder,
    updateOrderMutation,
    trackingKeys,
    getTrackingMetaKey
  } = useOrderActions();

  const handleUpdateOrder = async () => {
    await updateOrder(
      editingOrder,
      orderStatus,
      trackingNumber,
      orderNotes,
      resetDialog,
      () => {
        // Refetch relevant data
        queries.pending.refetch();
        queries.processing.refetch();
        queries.onHold.refetch();
        queries.inTransit.refetch();
      }
    );
  };

  const handleRefreshAll = () => {
    handleRefresh();
    toast.success('Orders refreshed');
  };

  return {
    // State
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
    
    // Data
    ordersByStatus,
    queries,
    
    // Functions
    handleEditOrder,
    handleUpdateOrder,
    handleRefresh: handleRefreshAll,
    updateOrderMutation,
    trackingKeys,
    getTrackingMetaKey: (order: any) => getTrackingMetaKey(order)
  };
};
