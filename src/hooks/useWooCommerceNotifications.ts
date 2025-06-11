
import { useState, useEffect } from 'react';
import { useOrders } from './useWooCommerceOrders';
import { useProducts } from './useWooCommerceProducts';
import { OrderStats, ProductStats, Notification } from '../types/woocommerce';

export const useOrderStats = (dateRange?: { date_min?: string; date_max?: string }) => {
  const { data: response, isLoading, error } = useOrders({ 
    per_page: 100, // Fixed: Use valid per_page limit
    after: dateRange?.date_min,
    before: dateRange?.date_max 
  });
  
  // Fixed: Initialize stats properly and add guards
  let stats: OrderStats | undefined;
  
  if (response?.data && Array.isArray(response.data)) {
    const orders = response.data;
    stats = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      onHold: orders.filter(o => o.status === 'on-hold').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      refunded: orders.filter(o => o.status === 'refunded').length,
      failed: orders.filter(o => o.status === 'failed').length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0),
      refundRate: orders.length > 0 ? (orders.filter(o => o.status === 'refunded').length / orders.length) * 100 : 0,
    };
  }

  return { data: stats, isLoading, error };
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
