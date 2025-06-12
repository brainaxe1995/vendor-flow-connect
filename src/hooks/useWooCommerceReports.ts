
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

// Helper to create date objects for last 30 days
const getLastThirtyDaysRange = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  return {
    date_min: thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD
    date_max: now.toISOString().split('T')[0] // YYYY-MM-DD
  };
};

// Reports hooks
export const useSalesReport = (params?: {
  period?: string;
  date_min?: string;
  date_max?: string;
  category_id?: number;
}) => {
  const { isConfigured } = useWooCommerceConfig();
  
  // Use last 30 days by default if no dates are provided
  const dateParams = params?.date_min && params?.date_max ? 
    params : 
    { ...params, ...getLastThirtyDaysRange() };
  
  return useQuery({
    queryKey: ['sales-report', dateParams],
    queryFn: () => wooCommerceService.getSalesReport(dateParams),
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
  
  // Use last 30 days by default if no dates are provided
  const dateParams = params?.date_min && params?.date_max ? 
    params : 
    { ...params, ...getLastThirtyDaysRange() };
  
  return useQuery({
    queryKey: ['top-sellers', dateParams],
    queryFn: () => wooCommerceService.getTopSellersReport({
      ...dateParams,
      per_page: validatePerPage(params?.per_page)
    }),
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
    retry: 1,
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
    // Make sure categories are defined before filtering
    const categoryMap = new Map();
    
    // Create a map for faster lookups
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        orderCount: 0,
        totalSales: 0
      });
    });
    
    // Process orders safely
    orders.forEach(order => {
      if (order.line_items && Array.isArray(order.line_items)) {
        order.line_items.forEach(item => {
          if (item.product_id) {
            // Find categories for this product
            const productCategories = item.categories || [];
            productCategories.forEach(catId => {
              const category = categoryMap.get(catId);
              if (category) {
                category.orderCount++;
                category.totalSales += parseFloat(item.total || '0');
              }
            });
          }
        });
      }
    });
    
    // Convert map back to array for return
    categorySales = Array.from(categoryMap.values())
      .map(cat => ({
        name: cat.name,
        value: cat.orderCount,
        sales: cat.totalSales,
        label: `${cat.name} (${cat.orderCount} orders)`
      }))
      .filter(item => item.value > 0);
  }

  return { data: categorySales, isLoading };
};
