
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  wooCommerceService, 
  SalesReport,
  TopSellerReport
} from '../services/woocommerce';
import { useWooCommerceConfig } from './useWooCommerceConfig';
import { useOrders } from './useWooCommerceOrders';
import { useCategories } from './useWooCommerceProducts';

// Helper to ensure per_page is within valid limits
const validatePerPage = (perPage?: number): number => {
  if (!perPage) return 20;
  return Math.min(Math.max(perPage, 1), 100);
};

// Reports hooks
export const useSalesReport = (params?: {
  period?: string;
  date_min?: string;
  date_max?: string;
  category_id?: number;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['sales-report', params],
    queryFn: () => wooCommerceService.getSalesReport(params),
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopSellers = (params?: {
  period?: string;
  date_min?: string;
  date_max?: string;
  per_page?: number;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  return useQuery({
    queryKey: ['top-sellers', params],
    queryFn: () => wooCommerceService.getTopSellersReport({
      ...params,
      per_page: validatePerPage(params?.per_page)
    }),
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
  });
};

// Export hook
export const useExportData = () => {
  return useMutation({
    mutationFn: async (params: {
      type: 'orders' | 'products' | 'customers' | 'refunds';
      format: 'csv' | 'pdf';
      date_min?: string;
      date_max?: string;
      status?: string;
    }) => {
      const blob = await wooCommerceService.exportData(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${params.type}_export_${new Date().toISOString().split('T')[0]}.${params.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return blob;
    },
  });
};

// Category sales data
export const useCategorySales = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories();
  const { data: ordersResponse, isLoading: ordersLoading } = useOrders({
    per_page: 100, // Fixed: Use valid per_page limit
    after: dateRange?.date_min,
    before: dateRange?.date_max
  });

  // Fixed: Add proper guards and initialization
  const categories = categoriesResponse?.data || [];
  const orders = ordersResponse?.data || [];
  const isLoading = categoriesLoading || ordersLoading;

  let categorySales: any[] = [];
  
  if (Array.isArray(categories) && Array.isArray(orders)) {
    categorySales = categories.map(category => {
      const categoryOrders = orders.filter(order => 
        order.line_items && Array.isArray(order.line_items) && 
        order.line_items.some(item => 
          item.product_id && categories.find(cat => cat.id === category.id)
        )
      );
      
      const totalSales = categoryOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
      const orderCount = categoryOrders.length;

      return {
        name: category.name,
        value: orderCount,
        sales: totalSales,
        label: `${category.name} (${orderCount} orders)`
      };
    }).filter(item => item.value > 0);
  }

  return { data: categorySales, isLoading };
};
