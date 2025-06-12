import React, { createContext, useContext } from 'react';
import { WooCommerceConfig } from '@/types/woocommerce';

export interface WooCommerceConfigContextValue {
  config: WooCommerceConfig | null;
  isConfigured: boolean;
  loading: boolean;
  saveConfig: (config: WooCommerceConfig) => Promise<boolean>;
  reloadConfig: () => Promise<WooCommerceConfig | null>;
}

export const WooCommerceConfigContext = createContext<WooCommerceConfigContextValue | undefined>(undefined);

export const useWooCommerceConfigContext = () => {
  const ctx = useContext(WooCommerceConfigContext);
  if (!ctx) throw new Error('WooCommerceConfigContext not provided');
  return ctx;
};
