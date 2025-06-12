import { useEffect, useRef } from 'react';
import { wooCommerceService } from '@/services/woocommerce';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useWooCommerceConfig } from './useWooCommerceConfig';
import type { Database } from '@/integrations/supabase/types';

const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes

export const useNotificationSync = () => {
  const { user } = useSupabaseAuth();
  const { isConfigured } = useWooCommerceConfig();
  const lastSyncRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!user || !isConfigured) return;

    const createIfNotExists = async (
      notif: Omit<Database['public']['Tables']['notifications']['Insert'], 'user_id'> & { eventId: string }
    ) => {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .contains('data', { event_id: notif.eventId })
        .limit(1)
        .maybeSingle();

      if (existing) return;

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        data: { ...notif.data, event_id: notif.eventId },
        read: false
      });
    };

    const sync = async () => {
      const since = lastSyncRef.current;
      lastSyncRef.current = new Date();

      try {
        const ordersRes = await wooCommerceService.getOrders({ per_page: 50 });
        const orders = ordersRes.data || [];
        for (const order of orders) {
          const created = new Date(order.date_created);
          const modified = new Date(order.date_modified);

          if (created > since) {
            await createIfNotExists({
              eventId: `order-new-${order.id}`,
              title: `Order #${order.id} placed`,
              message: `Total $${order.total}`,
              type: 'order',
              data: { order_id: order.id }
            });
          }

          if (modified > since) {
            await createIfNotExists({
              eventId: `order-status-${order.id}-${order.status}`,
              title: `Order #${order.id} ${order.status}`,
              message: `Status changed to ${order.status}`,
              type: order.status === 'refunded' ? 'payment' : 'order',
              data: { order_id: order.id, status: order.status }
            });

            if (order.date_paid && new Date(order.date_paid) > since) {
              await createIfNotExists({
                eventId: `payment-${order.id}`,
                title: `Payment received for #${order.id}`,
                message: `Amount $${order.total}`,
                type: 'payment',
                data: { order_id: order.id }
              });
            }
          }
        }
      } catch (err) {
        console.error('Order sync failed', err);
      }

      try {
        const productsRes = await wooCommerceService.getProducts({ per_page: 50 });
        const products = productsRes.data || [];
        for (const product of products) {
          const created = new Date(product.date_created);
          const modified = new Date(product.date_modified);

          if (created > since) {
            await createIfNotExists({
              eventId: `product-new-${product.id}`,
              title: `New product ${product.name}`,
              message: 'Product added',
              type: 'product',
              data: { product_id: product.id }
            });
          }

          if (modified > since) {
            if (product.stock_status === 'outofstock') {
              await createIfNotExists({
                eventId: `product-${product.id}-out` ,
                title: `${product.name} out of stock`,
                message: 'Item is out of stock',
                type: 'product',
                data: { product_id: product.id }
              });
            } else if (product.stock_quantity !== null && product.stock_quantity <= 5) {
              await createIfNotExists({
                eventId: `product-${product.id}-low-${product.stock_quantity}`,
                title: `Low stock: ${product.name}`,
                message: `Only ${product.stock_quantity} left`,
                type: 'product',
                data: { product_id: product.id }
              });
            }
          }
        }
      } catch (err) {
        console.error('Product sync failed', err);
      }
    };

    sync();
    const timer = setInterval(sync, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [user, isConfigured]);
};

