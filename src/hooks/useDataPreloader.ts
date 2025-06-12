import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wooCommerceService } from '@/services/woocommerce';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useWooCommerceConfig } from './useWooCommerceConfig';

export const useDataPreloader = () => {
  const { user } = useSupabaseAuth();
  const { isConfigured } = useWooCommerceConfig();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !isConfigured) return;

    const preload = async () => {
      try {
        await Promise.all([
          queryClient.prefetchQuery(['orders', { status: 'processing', per_page: 50, page: 1 }], () =>
            wooCommerceService.getOrders({ status: 'processing', per_page: 50, page: 1 })
          ),
          queryClient.prefetchQuery(['products', {}], () =>
            wooCommerceService.getProducts({ per_page: 50 })
          ),
          queryClient.prefetchQuery(['categories', {}], () =>
            wooCommerceService.getCategories({ per_page: 50 })
          ),
          queryClient.prefetchQuery(['notifications'], async () => {
            const { data } = await supabase
              .from('notifications')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            return data || [];
          }),
        ]);
      } catch (err) {
        console.error('Preload failed', err);
      }
    };

    preload();
  }, [user, isConfigured, queryClient]);
};
