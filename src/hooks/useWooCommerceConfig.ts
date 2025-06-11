
import { useState, useEffect } from 'react';
import { wooCommerceService } from '../services/woocommerce';
import { WooCommerceConfig } from '../types/woocommerce';

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
  const [config, setConfig] = useState<WooCommerceConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('woocommerce_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.storeUrl && parsedConfig.consumerKey && parsedConfig.consumerSecret) {
          // Only update if config actually changed
          if (!deepEqual(config, parsedConfig)) {
            setConfig(parsedConfig);
            wooCommerceService.setConfig(parsedConfig);
            setIsConfigured(parsedConfig.status === 'active');
            console.log('WooCommerce config loaded from storage');
          }
        } else {
          console.warn('Invalid WooCommerce config found, clearing...');
          localStorage.removeItem('woocommerce_config');
        }
      } catch (error) {
        console.error('Failed to parse saved config:', error);
        localStorage.removeItem('woocommerce_config');
      }
    }
  }, []); // Empty dependency array to prevent loops

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
      
      setConfig(updatedConfig);
      localStorage.setItem('woocommerce_config', JSON.stringify(updatedConfig));
      setIsConfigured(isConnected);
      console.log('WooCommerce config updated successfully');
      
      return isConnected;
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  };

  return { config, saveConfig, isConfigured };
};
