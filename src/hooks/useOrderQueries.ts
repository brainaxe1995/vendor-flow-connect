
import { useOrders, useTrackingDetection } from './useWooCommerce';
import { getTrackingNumber } from '../utils/orderUtils';

export const useOrderQueries = (searchTerm: string, currentPage: number) => {
  const perPage = 100;
  
  // Get tracking keys for dynamic key detection
  const { data: trackingKeys } = useTrackingDetection();
  const primaryTrackingKey = trackingKeys?.[0] || '_wot_tracking_number';

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
    meta_key: primaryTrackingKey,
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
  
  // Fixed: Use 'pending' instead of 'pending-payment' for WooCommerce API compatibility
  const pendingPaymentQuery = useOrders({ 
    status: 'pending', 
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

  const queries = {
    pending: pendingQuery,
    processing: processingQuery,
    onHold: onHoldQuery,
    inTransit: inTransitQuery,
    completed: completedQuery,
    cancelled: cancelledQuery,
    refunded: refundedQuery,
    failed: failedQuery,
    pendingPayment: pendingPaymentQuery
  };

  const handleRefresh = () => {
    pendingQuery.refetch();
    processingQuery.refetch();
    onHoldQuery.refetch();
    inTransitQuery.refetch();
  };

  return {
    ordersByStatus,
    queries,
    handleRefresh
  };
};
