
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  wooCommerceService, 
  WooCommerceOrder,
  WooCommerceResponse 
} from '../services/woocommerce';
import { useWooCommerceConfig } from './useWooCommerceConfig';

// Helper to ensure per_page is within valid limits
const validatePerPage = (perPage?: number): number => {
  if (!perPage) return 20;
  return Math.min(Math.max(perPage, 1), 100);
};

// Orders hooks
export const useOrders = (params?: {
  status?: string;
  per_page?: number;
  page?: number;
  after?: string;
  before?: string;
  search?: string;
  meta_key?: string;
  meta_compare?: string;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async (): Promise<WooCommerceResponse<WooCommerceOrder[]>> => {
      try {
        // Validate per_page parameter
        const validatedParams = {
          ...params,
          per_page: validatePerPage(params?.per_page),
          page: Math.max(params?.page || 1, 1)
        };
        
        console.log('Fetching orders with validated params:', validatedParams);
        const response = await wooCommerceService.getOrders(validatedParams);
        console.log('Orders response:', response);
        return response;
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return {
          data: [],
          totalPages: 0,
          totalRecords: 0,
          hasMore: false
        };
      }
    },
    enabled: isConfigured,
    staleTime: 30 * 1000,
  });
};

export const useOrder = (orderId: number) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => wooCommerceService.getOrder(orderId),
    enabled: isConfigured && !!orderId,
    staleTime: 60 * 1000,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: Partial<WooCommerceOrder> }) =>
      wooCommerceService.updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// In-transit orders (orders with tracking but not delivered)
export const useInTransitOrders = () => {
  const { data: ordersResponse, isLoading } = useOrders({
    status: 'processing',
    per_page: 100
  });

  // Safely handle the data with proper initialization
  const orders = ordersResponse?.data || [];
  
  // Fixed: Properly initialize inTransitOrders and fix the filter logic
  const inTransitOrders = Array.isArray(orders) ? orders.filter(order => {
    // Early return if order or meta_data is invalid
    if (!order || !order.meta_data || !Array.isArray(order.meta_data)) {
      return false;
    }
    
    // Check if any meta_data entry contains tracking information
    return order.meta_data.some(metaItem => {
      if (!metaItem || !metaItem.key) return false;
      const keyLower = metaItem.key.toLowerCase();
      return keyLower.includes('tracking') && metaItem.value && metaItem.value.trim() !== '';
    });
  }) : [];

  return { data: inTransitOrders, isLoading };
};

export const useRefunds = (orderId: number) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['refunds', orderId],
    queryFn: () => wooCommerceService.getRefunds(orderId),
    enabled: isConfigured && !!orderId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { 
      orderId: number; 
      data: {
        amount?: string;
        reason?: string;
        refund_payment?: boolean;
        line_items?: Array<{ id: number; quantity: number; refund_total: string }>;
      }
    }) => wooCommerceService.createRefund(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['refunds', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useTrackingDetection = () => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['tracking-detection'],
    queryFn: () => wooCommerceService.detectTrackingMetaKey(),
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};
