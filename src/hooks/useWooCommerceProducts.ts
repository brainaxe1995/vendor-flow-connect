
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  wooCommerceService, 
  WooCommerceProduct,
  WooCommerceCategory,
  WooCommerceResponse 
} from '../services/woocommerce';
import { useWooCommerceConfig } from './useWooCommerceConfig';

// Helper to ensure per_page is within valid limits
const validatePerPage = (perPage?: number): number => {
  if (!perPage) return 20;
  return Math.min(Math.max(perPage, 1), 100);
};

export const useProducts = (params?: {
  status?: string;
  per_page?: number;
  page?: number;
  search?: string;
  stock_status?: string;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        // Validate per_page parameter
        const validatedParams = {
          ...params,
          per_page: validatePerPage(params?.per_page),
          page: Math.max(params?.page || 1, 1)
        };
        
        const response = await wooCommerceService.getProducts(validatedParams);
        return response;
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return {
          data: [],
          totalPages: 0,
          totalRecords: 0,
          hasMore: false
        };
      }
    },
    enabled: isConfigured,
    refetchInterval: 60000,
    retry: 3,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: Partial<WooCommerceProduct> }) =>
      wooCommerceService.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Categories hooks
export const useCategories = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
  parent?: number;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  hide_empty?: boolean;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async (): Promise<WooCommerceResponse<WooCommerceCategory[]>> => {
      try {
        // Validate per_page parameter
        const validatedParams = {
          ...params,
          per_page: validatePerPage(params?.per_page),
          page: Math.max(params?.page || 1, 1)
        };
        
        console.log('Fetching categories with validated params:', validatedParams);
        const response = await wooCommerceService.getCategories(validatedParams);
        console.log('Categories response:', response);
        return response;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return {
          data: [],
          totalPages: 0,
          totalRecords: 0,
          hasMore: false
        };
      }
    },
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
  });
};
