
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WooCommerceConfig } from '@/types/woocommerce';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useSupabaseConfig = () => {
  const { user } = useSupabaseAuth();
  const [config, setConfig] = useState<WooCommerceConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const saveWooCommerceConfig = async (configData: WooCommerceConfig) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      // First, check if a config already exists for this user
      const { data: existingConfig } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingConfig) {
        throw new Error('User profile not found');
      }

      // Store WooCommerce config in user's address field as JSONB
      const { data, error } = await supabase
        .from('profiles')
        .update({
          address: {
            woocommerce_config: configData
          }
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setConfig(configData);
      console.log('WooCommerce config saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving WooCommerce config:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadWooCommerceConfig = async () => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const wooConfig = data?.address?.woocommerce_config as WooCommerceConfig;
      setConfig(wooConfig || null);
      console.log('WooCommerce config loaded from Supabase');
      return wooConfig;
    } catch (error) {
      console.error('Error loading WooCommerce config:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWooCommerceConfig();
    }
  }, [user]);

  return {
    config,
    loading,
    saveWooCommerceConfig,
    loadWooCommerceConfig
  };
};
