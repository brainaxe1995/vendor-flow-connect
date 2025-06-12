
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
      // Convert to JSON-compatible format
      const addressData = {
        woocommerce_config: {
          storeUrl: configData.storeUrl,
          consumerKey: configData.consumerKey,
          consumerSecret: configData.consumerSecret,
          environment: configData.environment,
          permissions: configData.permissions,
          status: configData.status,
          lastUsed: configData.lastUsed || null,
          lastSync: configData.lastSync || null
        }
      };

      const { data, error } = await supabase
        .from('profiles')
        .update({
          address: addressData
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

      // Safely extract WooCommerce config from JSONB
      let wooConfig: WooCommerceConfig | null = null;
      
      if (data?.address && typeof data.address === 'object' && data.address !== null) {
        const addressObj = data.address as Record<string, any>;
        if (addressObj.woocommerce_config) {
          const configData = addressObj.woocommerce_config;
          wooConfig = {
            storeUrl: configData.storeUrl || '',
            consumerKey: configData.consumerKey || '',
            consumerSecret: configData.consumerSecret || '',
            environment: configData.environment || 'live',
            permissions: configData.permissions || 'write',
            status: configData.status || 'inactive',
            lastUsed: configData.lastUsed || undefined,
            lastSync: configData.lastSync || undefined
          } as WooCommerceConfig;
        }
      }
      
      setConfig(wooConfig);
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
