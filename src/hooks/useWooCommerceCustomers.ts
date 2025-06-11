
import { useQuery } from '@tanstack/react-query';
import { 
  wooCommerceService, 
  WooCommerceCustomer,
  WooCommerceResponse 
} from '../services/woocommerce';
import { useWooCommerceConfig } from './useWooCommerceConfig';

// Helper to ensure per_page is within valid limits
const validatePerPage = (perPage?: number): number => {
  if (!perPage) return 20;
  return Math.min(Math.max(perPage, 1), 100);
};

// Customers hooks
export const useCustomers = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
  email?: string;
  include?: number[];
  exclude?: number[];
  orderby?: 'id' | 'include' | 'name' | 'registered_date';
  order?: 'asc' | 'desc';
  after?: string;
  before?: string;
  role?: string;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async (): Promise<WooCommerceResponse<WooCommerceCustomer[]>> => {
      try {
        // Validate per_page parameter
        const validatedParams = {
          ...params,
          per_page: validatePerPage(params?.per_page),
          page: Math.max(params?.page || 1, 1)
        };
        
        console.log('Fetching customers with validated params:', validatedParams);
        const response = await wooCommerceService.getCustomers(validatedParams);
        console.log('Customers response:', response);
        return response;
      } catch (error) {
        console.error('Failed to fetch customers:', error);
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

// Customer acquisition with date filtering
export const useCustomerAcquisition = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { data: response, isLoading, error } = useCustomers({
    per_page: 100, // Fixed: Use valid per_page limit
    after: dateRange?.date_min,
    before: dateRange?.date_max,
    orderby: 'registered_date',
    order: 'desc'
  });

  // Fixed: Add proper guards and initialization
  let acquisitionData: Record<string, number> = {};
  
  if (response?.data && Array.isArray(response.data)) {
    acquisitionData = response.data.reduce((acc, customer) => {
      const date = new Date(customer.date_created).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  const chartData = Object.entries(acquisitionData).map(([date, count]) => ({
    date,
    customers: count
  })).sort((a, b) => a.date.localeCompare(b.date));

  return { data: chartData, isLoading, error };
};
