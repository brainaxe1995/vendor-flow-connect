import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  wooCommerceService, 
  WooCommerceOrder, 
  WooCommerceProduct, 
  WooCommerceCategory,
  WooCommerceCustomer,
  SalesReport,
  TopSellerReport,
  WooCommerceResponse 
} from '../services/woocommerce';
import { WooCommerceConfig, OrderStats, ProductStats, Notification } from '../types/woocommerce';

export const useWooCommerceConfig = () => {
  const [config, setConfig] = useState<WooCommerceConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('woocommerce_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.storeUrl && parsedConfig.consumerKey && parsedConfig.consumerSecret) {
          setConfig(parsedConfig);
          wooCommerceService.setConfig(parsedConfig);
          setIsConfigured(parsedConfig.status === 'active');
        } else {
          console.warn('Invalid WooCommerce config found, clearing...');
          localStorage.removeItem('woocommerce_config');
        }
      } catch (error) {
        console.error('Failed to parse saved config:', error);
        localStorage.removeItem('woocommerce_config');
      }
    }
  }, []);

  const saveConfig = async (newConfig: WooCommerceConfig) => {
    try {
      if (!newConfig.storeUrl?.trim() || !newConfig.consumerKey?.trim() || !newConfig.consumerSecret?.trim()) {
        throw new Error('Missing required configuration fields');
      }

      wooCommerceService.setConfig(newConfig);
      const isConnected = await wooCommerceService.testConnection();
      
      const updatedConfig = {
        ...newConfig,
        status: isConnected ? 'active' as const : 'inactive' as const,
        lastUsed: new Date().toISOString(),
        lastSync: isConnected ? new Date().toISOString() : ''
      };
      
      setConfig(updatedConfig);
      localStorage.setItem('woocommerce_config', JSON.stringify(updatedConfig));
      setIsConfigured(isConnected);
      
      return isConnected;
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  };

  return { config, saveConfig, isConfigured };
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
        console.log('Fetching orders with params:', params);
        const response = await wooCommerceService.getOrders(params);
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
        const response = await wooCommerceService.getProducts(params);
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
        console.log('Fetching categories with params:', params);
        const response = await wooCommerceService.getCategories(params);
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
        console.log('Fetching customers with params:', params);
        const response = await wooCommerceService.getCustomers(params);
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
    queryFn: () => wooCommerceService.getTopSellersReport(params),
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

export const useOrderStats = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { data: response, isLoading, error } = useOrders({ 
    per_page: 1000,
    after: dateRange?.date_min,
    before: dateRange?.date_max 
  });
  
  const stats = response?.data ? {
    pending: response.data.filter(o => o.status === 'pending').length,
    processing: response.data.filter(o => o.status === 'processing').length,
    onHold: response.data.filter(o => o.status === 'on-hold').length,
    completed: response.data.filter(o => o.status === 'completed').length,
    cancelled: response.data.filter(o => o.status === 'cancelled').length,
    refunded: response.data.filter(o => o.status === 'refunded').length,
    failed: response.data.filter(o => o.status === 'failed').length,
    pendingPayment: response.data.filter(o => o.status === 'pending-payment').length,
    totalRevenue: response.data.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0),
    refundRate: response.data.length > 0 ? (response.data.filter(o => o.status === 'refunded').length / response.data.length) * 100 : 0,
  } : undefined;

  return { data: stats, isLoading, error };
};

export const useProductStats = () => {
  const { data: response, isLoading, error } = useProducts({ per_page: 1000 });
  
  const stats = response?.data ? {
    total: response.data.length,
    inStock: response.data.filter(p => p.stock_status === 'instock').length,
    outOfStock: response.data.filter(p => p.stock_status === 'outofstock').length,
    onBackorder: response.data.filter(p => p.stock_status === 'onbackorder').length,
    lowStock: response.data.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
  } : undefined;

  return { data: stats, isLoading, error };
};

// Customer acquisition with date filtering
export const useCustomerAcquisition = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { data: response, isLoading, error } = useCustomers({
    per_page: 1000,
    after: dateRange?.date_min,
    before: dateRange?.date_max,
    orderby: 'registered_date',
    order: 'desc'
  });

  const acquisitionData = response?.data ? response.data.reduce((acc, customer) => {
    const date = new Date(customer.date_created).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const chartData = Object.entries(acquisitionData).map(([date, count]) => ({
    date,
    customers: count
  })).sort((a, b) => a.date.localeCompare(b.date));

  return { data: chartData, isLoading, error };
};

// Category sales data
export const useCategorySales = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { data: categoriesResponse } = useCategories();
  const { data: ordersResponse } = useOrders({
    per_page: 1000,
    after: dateRange?.date_min,
    before: dateRange?.date_max
  });

  const categories = categoriesResponse?.data || [];
  const orders = ordersResponse?.data || [];

  const categorySales = categories.map(category => {
    const categoryOrders = orders.filter(order => 
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

  return { data: categorySales };
};

export const useNotifications = () => {
  const { data: ordersResponse } = useOrders({ per_page: 50 });
  const { data: productsResponse } = useProducts({ per_page: 50 });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const orders = ordersResponse?.data;
    const products = productsResponse?.data;
    
    if (!orders || !products) return;

    const newNotifications: Notification[] = [];
    const now = new Date();

    // New orders notifications (last 24 hours)
    orders.forEach(order => {
      const orderDate = new Date(order.date_created);
      const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceOrder < 24 && ['pending', 'processing'].includes(order.status)) {
        newNotifications.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${order.id} from ${order.billing.first_name} ${order.billing.last_name} - $${order.total}`,
          time: order.date_created,
          read: false,
          orderId: order.id,
        });
      }

      if (order.status === 'on-hold') {
        newNotifications.push({
          id: `hold-${order.id}`,
          type: 'delay',
          title: 'Order On Hold',
          message: `Order #${order.id} requires attention`,
          time: order.date_modified,
          read: false,
          orderId: order.id,
        });
      }
    });

    // Low stock notifications
    products.forEach(product => {
      if (product.stock_quantity > 0 && product.stock_quantity <= 5) {
        newNotifications.push({
          id: `stock-${product.id}`,
          type: 'stock',
          title: 'Low Stock Alert',
          message: `${product.name} has only ${product.stock_quantity} items left`,
          time: new Date().toISOString(),
          read: false,
          productId: product.id,
        });
      }
    });

    setNotifications(newNotifications);
  }, [ordersResponse, productsResponse]);

  return { data: notifications, isLoading: false };
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
