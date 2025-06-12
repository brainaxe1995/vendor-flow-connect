
import { useState, useEffect } from 'react';
import { wooCommerceService } from '../services/woocommerce';
import { WooCommerceConfig } from '../types/woocommerce';
import { useSupabaseConfig } from './useSupabaseConfig';
import { useSupabaseAuth } from './useSupabaseAuth';

// Helper for deep equality check to prevent redundant config updates
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

export const useWooCommerceConfig = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const {
    config: supabaseConfig,
    saveWooCommerceConfig: saveToSupabase,
    loadWooCommerceConfig,
    loading: supabaseLoading,
  } = useSupabaseConfig();
  const [config, setConfig] = useState<WooCommerceConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user && supabaseConfig) {
      if (!deepEqual(config, supabaseConfig)) {
        setConfig(supabaseConfig);
        wooCommerceService.setConfig(supabaseConfig);
        setIsConfigured(supabaseConfig.status === 'active');
        console.log('WooCommerce config loaded from Supabase');
      }
      setLoading(false);
    } else if (user && !supabaseConfig && !supabaseLoading) {
      // Config missing - try to load from Supabase
      loadWooCommerceConfig();
    } else if (!user) {
      setConfig(null);
      setIsConfigured(false);
      setLoading(false);
      console.log('User logged out, clearing WooCommerce config');
    }
  }, [user, supabaseConfig, supabaseLoading, authLoading]);

  // Update loading state when Supabase hook is fetching
  useEffect(() => {
    if (supabaseLoading) {
      setLoading(true);
    }
  }, [supabaseLoading]);

  const saveConfig = async (newConfig: WooCommerceConfig) => {
    try {
      if (!newConfig.storeUrl?.trim() || !newConfig.consumerKey?.trim() || !newConfig.consumerSecret?.trim()) {
        throw new Error('Missing required configuration fields');
      }

      // Only proceed if config actually changed
      if (deepEqual(config, newConfig)) {
        console.log('Config unchanged, skipping update');
        return isConfigured;
      }

      wooCommerceService.setConfig(newConfig);
      const isConnected = await wooCommerceService.testConnection();
      
      const updatedConfig = {
        ...newConfig,
        status: isConnected ? 'active' as const : 'inactive' as const,
        lastUsed: new Date().toISOString(),
        lastSync: isConnected ? new Date().toISOString() : ''
      };
      
      if (user) {
        // Save to Supabase if user is authenticated
        await saveToSupabase(updatedConfig);
        setConfig(updatedConfig);
        setIsConfigured(isConnected);
        console.log('WooCommerce config saved to Supabase successfully');
      } else {
        throw new Error('User must be logged in to save configuration');
      }
      
      return isConnected;
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  };

  return {
    config,
    saveConfig,
    isConfigured,
    loading,
    reloadConfig: loadWooCommerceConfig,
  };
};
