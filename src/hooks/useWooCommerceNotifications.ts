
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from './useWooCommerceProducts';
import { useOrders } from './useWooCommerceOrders';
import { useWooCommerceConfig } from './useWooCommerceConfig';
import { wooCommerceService } from '../services/woocommerce';
import { OrderStats, ProductStats, Notification } from '../types/woocommerce';

export const useOrderStats = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { isConfigured } = useWooCommerceConfig();

  return useQuery({
    queryKey: ['order-stats', dateRange],
    enabled: isConfigured,
    queryFn: async (): Promise<OrderStats> => {
      const statuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];

      const requests = await Promise.all(
        statuses.map(status =>
          wooCommerceService.getOrders({ status, per_page: 1, after: dateRange?.date_min, before: dateRange?.date_max })
        )
      );

      const counts: Record<string, number> = {};
      statuses.forEach((status, idx) => {
        counts[status] = requests[idx].totalRecords;
      });

      const allOrders = await wooCommerceService.getOrders({ per_page: 1, after: dateRange?.date_min, before: dateRange?.date_max });
      const allTimeRange = {
        date_min: '2000-01-01',
        date_max: new Date().toISOString().split('T')[0],
      };
      const sales = await wooCommerceService.getSalesReport(allTimeRange);

      return {
        pending: counts['pending'] || 0,
        processing: counts['processing'] || 0,
        onHold: counts['on-hold'] || 0,
        completed: counts['completed'] || 0,
        cancelled: counts['cancelled'] || 0,
        refunded: counts['refunded'] || 0,
        failed: counts['failed'] || 0,
        totalRevenue: parseFloat((sales as any).total_sales ?? '0'),
        refundRate: allOrders.totalRecords > 0 ? (counts['refunded'] / allOrders.totalRecords) * 100 : 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductStats = () => {
  const { data: response, isLoading, error } = useProducts({ per_page: 100 }); // Fixed: Use valid per_page limit
  
  // Fixed: Initialize stats properly and add guards
  let stats: ProductStats | undefined;
  
  if (response?.data && Array.isArray(response.data)) {
    const products = response.data;
    stats = {
      total: products.length,
      inStock: products.filter(p => p.stock_status === 'instock').length,
      outOfStock: products.filter(p => p.stock_status === 'outofstock').length,
      onBackorder: products.filter(p => p.stock_status === 'onbackorder').length,
      lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
    };
  }

  return { data: stats, isLoading, error };
};

export const useNotifications = () => {
  const { data: ordersResponse } = useOrders({ per_page: 50 });
  const { data: productsResponse } = useProducts({ per_page: 50 });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fixed: Add proper guards before accessing data
    const orders = ordersResponse?.data;
    const products = productsResponse?.data;
    
    if (!orders || !Array.isArray(orders) || !products || !Array.isArray(products)) return;

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
