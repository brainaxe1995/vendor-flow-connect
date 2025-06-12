import React, { useState, useEffect } from 'react';
import { WooCommerceConfigContext, WooCommerceConfigContextValue } from '@/context/WooCommerceConfigContext';
import { wooCommerceService } from '@/services/woocommerce';
import { WooCommerceConfig } from '@/types/woocommerce';
import { useSupabaseConfig } from './useSupabaseConfig';
import { useSupabaseAuth } from './useSupabaseAuth';

// Helper for deep equality check
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

// Provider hook with previous logic
const useProvideWooCommerceConfig = (): WooCommerceConfigContextValue => {
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
      }
      setLoading(false);
    } else if (user && !supabaseConfig && !supabaseLoading) {
      loadWooCommerceConfig();
    } else if (!user) {
      setConfig(null);
      setIsConfigured(false);
      setLoading(false);
    }
  }, [user, supabaseConfig, supabaseLoading, authLoading]);

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

      if (deepEqual(config, newConfig)) {
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
        await saveToSupabase(updatedConfig);
        setConfig(updatedConfig);
        setIsConfigured(isConnected);
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

export const WooCommerceConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useProvideWooCommerceConfig();
  return <WooCommerceConfigContext.Provider value={value}>{children}</WooCommerceConfigContext.Provider>;
};

export const useWooCommerceConfig = () => {
  const context = React.useContext(WooCommerceConfigContext);
  if (!context) {
    throw new Error('useWooCommerceConfig must be used within WooCommerceConfigProvider');
  }
  return context;
};
