
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wooCommerceService, WooCommerceOrder, WooCommerceProduct } from '../services/woocommerce';
import { WooCommerceConfig, OrderStats, ProductStats, Notification } from '../types/woocommerce';

export const useWooCommerceConfig = () => {
  const [config, setConfig] = useState<WooCommerceConfig | null>(null);

  useEffect(() => {
    // Load config from localStorage or API
    const savedConfig = localStorage.getItem('woocommerce_config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      wooCommerceService.setConfig(parsedConfig);
    }
  }, []);

  const saveConfig = (newConfig: WooCommerceConfig) => {
    setConfig(newConfig);
    wooCommerceService.setConfig(newConfig);
    localStorage.setItem('woocommerce_config', JSON.stringify(newConfig));
  };

  return { config, saveConfig };
};

export const useOrders = (params?: {
  status?: string;
  per_page?: number;
  page?: number;
  after?: string;
  before?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => wooCommerceService.getOrders(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useOrder = (orderId: number) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => wooCommerceService.getOrder(orderId),
    enabled: !!orderId,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: Partial<WooCommerceOrder> }) =>
      wooCommerceService.updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
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
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => wooCommerceService.getProducts(params),
    refetchInterval: 60000, // Refetch every minute
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

export const useOrderStats = (): { data: OrderStats | undefined; isLoading: boolean } => {
  const { data: orders, isLoading } = useOrders({ per_page: 100 });
  
  const stats = orders ? {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    onHold: orders.filter(o => o.status === 'on-hold').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
    failed: orders.filter(o => o.status === 'failed').length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
    refundRate: orders.length > 0 ? (orders.filter(o => o.status === 'refunded').length / orders.length) * 100 : 0,
  } : undefined;

  return { data: stats, isLoading };
};

export const useProductStats = (): { data: ProductStats | undefined; isLoading: boolean } => {
  const { data: products, isLoading } = useProducts({ per_page: 100 });
  
  const stats = products ? {
    total: products.length,
    inStock: products.filter(p => p.stock_status === 'instock').length,
    outOfStock: products.filter(p => p.stock_status === 'outofstock').length,
    onBackorder: products.filter(p => p.stock_status === 'onbackorder').length,
    lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
  } : undefined;

  return { data: stats, isLoading };
};

export const useNotifications = (): { data: Notification[]; isLoading: boolean } => {
  const { data: orders } = useOrders({ per_page: 50 });
  const { data: products } = useProducts({ per_page: 50 });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!orders || !products) return;

    const newNotifications: Notification[] = [];
    const now = new Date();

    // New orders notifications
    orders.forEach(order => {
      const orderDate = new Date(order.date_created);
      const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceOrder < 24 && order.status === 'pending') {
        newNotifications.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${order.id} from ${order.billing.first_name} ${order.billing.last_name}`,
          time: order.date_created,
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
  }, [orders, products]);

  return { data: notifications, isLoading: false };
};

export const useTrackingDetection = () => {
  return useQuery({
    queryKey: ['tracking-keys'],
    queryFn: () => wooCommerceService.detectTrackingMetaKey(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
