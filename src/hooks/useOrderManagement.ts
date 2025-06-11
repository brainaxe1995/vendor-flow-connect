
import { useState } from 'react';
import { useOrders, useUpdateOrder, useTrackingDetection } from './useWooCommerce';
import { toast } from 'sonner';
import { getTrackingNumber, getTrackingMetaKey } from '../utils/orderUtils';

export const useOrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: trackingKeys } = useTrackingDetection();
  const updateOrderMutation = useUpdateOrder();

  const perPage = 100;

  // Fetch orders for different statuses with proper error handling
  const pendingQuery = useOrders({ 
    status: 'pending', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const processingQuery = useOrders({ 
    status: 'processing', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const onHoldQuery = useOrders({ 
    status: 'on-hold', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });

  const inTransitQuery = useOrders({ 
    status: 'processing', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage,
    meta_key: '_tracking_number',
    meta_compare: 'EXISTS'
  });

  const completedQuery = useOrders({ 
    status: 'completed', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const cancelledQuery = useOrders({ 
    status: 'cancelled', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const refundedQuery = useOrders({ 
    status: 'refunded', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const failedQuery = useOrders({ 
    status: 'failed', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const pendingPaymentQuery = useOrders({ 
    status: 'pending-payment', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });

  // Extract orders and pagination data from response format with safe fallbacks
  const ordersByStatus = {
    pending: pendingQuery.data?.data || [],
    processing: processingQuery.data?.data || [],
    onHold: onHoldQuery.data?.data || [],
    inTransit: (inTransitQuery.data?.data || []).filter(order => {
      try {
        return getTrackingNumber(order);
      } catch (error) {
        console.error('Error filtering in-transit orders:', error);
        return false;
      }
    }),
    completed: completedQuery.data?.data || [],
    cancelled: cancelledQuery.data?.data || [],
    refunded: refundedQuery.data?.data || [],
    failed: failedQuery.data?.data || [],
    pendingPayment: pendingPaymentQuery.data?.data || []
  };

  const handleEditOrder = (order: any) => {
    console.log('Editing order:', order);
    setEditingOrder(order);
    setOrderStatus(order.status || '');
    setTrackingNumber(getTrackingNumber(order) || '');
    setOrderNotes('');
    setIsDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      const updateData: any = {};
      
      // Update status if changed
      if (orderStatus && orderStatus !== editingOrder.status) {
        updateData.status = orderStatus;
        console.log('Updating status to:', orderStatus);
      }
      
      // Update tracking number if provided
      if (trackingNumber !== getTrackingNumber(editingOrder)) {
        const trackingKey = getTrackingMetaKey(editingOrder, trackingKeys);
        updateData.meta_data = [
          {
            key: trackingKey,
            value: trackingNumber
          }
        ];
        console.log('Updating tracking:', { key: trackingKey, value: trackingNumber });
      }
      
      // Add order notes if provided
      if (orderNotes) {
        updateData.customer_note = orderNotes;
      }

      console.log('Sending update data:', updateData);

      await updateOrderMutation.mutateAsync({
        orderId: editingOrder.id,
        data: updateData
      });

      toast.success('Order updated successfully');
      setIsDialogOpen(false);
      setEditingOrder(null);
      setTrackingNumber('');
      setOrderStatus('');
      setOrderNotes('');
      
      // Refetch relevant data
      pendingQuery.refetch();
      processingQuery.refetch();
      onHoldQuery.refetch();
      inTransitQuery.refetch();
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Update order error:', error);
    }
  };

  const handleRefresh = () => {
    pendingQuery.refetch();
    processingQuery.refetch();
    onHoldQuery.refetch();
    inTransitQuery.refetch();
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
    queries: {
      pending: pendingQuery,
      processing: processingQuery,
      onHold: onHoldQuery,
      inTransit: inTransitQuery,
      completed: completedQuery,
      cancelled: cancelledQuery,
      refunded: refundedQuery,
      failed: failedQuery,
      pendingPayment: pendingPaymentQuery
    },
    
    // Functions
    handleEditOrder,
    handleUpdateOrder,
    handleRefresh,
    updateOrderMutation,
    trackingKeys,
    getTrackingMetaKey: (order: any) => getTrackingMetaKey(order, trackingKeys)
  };
};
