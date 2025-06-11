
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  wooCommerceService, 
  WooCommerceOrder, 
  WooCommerceResponse 
} from '../services/woocommerce';
import { useWooCommerceConfig } from './useWooCommerceConfig';

// Valid WooCommerce order statuses
const VALID_ORDER_STATUSES = [
  'any', 'pending', 'processing', 'on-hold',
  'completed', 'cancelled', 'refunded', 'failed'
];

// Helper to validate and normalize order status
const validateOrderStatus = (status?: string): string | undefined => {
  if (!status) return undefined;
  
  // Handle invalid statuses by mapping to valid ones
  const statusMap: Record<string, string> = {
    'pending-payment': 'pending',
    'in-transit': 'processing', // Will use meta query for actual in-transit detection
    'delivered': 'completed',
    'returned': 'refunded'
  };
  
  const normalizedStatus = statusMap[status] || status;
  return VALID_ORDER_STATUSES.includes(normalizedStatus) ? normalizedStatus : undefined;
};

// Helper to ensure per_page is within valid limits
const validatePerPage = (perPage?: number): number => {
  if (!perPage) return 20;
  return Math.min(Math.max(perPage, 1), 100);
};

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
        // Validate and normalize parameters
        const validatedParams = {
          ...params,
          status: validateOrderStatus(params?.status),
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
    refetchInterval: 30000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      if (error?.status === 429) {
        return failureCount < 3; // Retry on rate limit
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrder = (orderId: number) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        return await wooCommerceService.getOrder(orderId);
      } catch (error) {
        console.error(`Failed to fetch order ${orderId}:`, error);
        throw error;
      }
    },
    enabled: !!orderId && isConfigured,
    retry: 2,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: number; data: Partial<WooCommerceOrder> }) => {
      try {
        console.log('Updating order mutation:', orderId, data);
        return await wooCommerceService.updateOrder(orderId, data);
      } catch (error) {
        console.error(`Failed to update order ${orderId}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.log('Order update successful, queries invalidated');
    },
    onError: (error) => {
      console.error('Update order mutation failed:', error);
    },
  });
};

// Hook for detecting in-transit orders using meta queries
export const useInTransitOrders = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['in-transit-orders', dateRange],
    queryFn: async (): Promise<WooCommerceResponse<WooCommerceOrder[]>> => {
      try {
        // Use meta query to detect in-transit orders (orders with tracking but not completed)
        const response = await wooCommerceService.getOrders({
          status: 'processing',
          meta_key: '_tracking_number',
          meta_compare: 'EXISTS',
          per_page: 100,
          after: dateRange?.date_min,
          before: dateRange?.date_max
        });
        return response;
      } catch (error) {
        console.error('Failed to fetch in-transit orders:', error);
        return {
          data: [],
          totalPages: 0,
          totalRecords: 0,
          hasMore: false
        };
      }
    },
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRefunds = (orderId?: number) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['refunds', orderId],
    queryFn: () => orderId ? wooCommerceService.getRefunds(orderId) : Promise.resolve([]),
    enabled: isConfigured && !!orderId,
  });
};

export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: any }) =>
      wooCommerceService.createRefund(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useTrackingDetection = () => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['tracking-keys'],
    queryFn: () => wooCommerceService.detectTrackingMetaKey(),
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  });
};
