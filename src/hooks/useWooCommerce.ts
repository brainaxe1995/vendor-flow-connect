
// Main WooCommerce hooks file - re-exports all hooks for backward compatibility
export { useWooCommerceConfig } from './useWooCommerceConfig';
export { 
  useOrders, 
  useOrder, 
  useUpdateOrder, 
  useInTransitOrders, 
  useRefunds, 
  useCreateRefund, 
  useTrackingDetection 
} from './useWooCommerceOrders';
export { 
  useProducts, 
  useUpdateProduct, 
  useCategories 
} from './useWooCommerceProducts';
export { 
  useCustomers, 
  useCustomerAcquisition 
} from './useWooCommerceCustomers';
export { 
  useSalesReport, 
  useTopSellers, 
  useExportData, 
  useCategorySales 
} from './useWooCommerceReports';
export { 
  useOrderStats, 
  useProductStats, 
  useNotifications 
} from './useWooCommerceNotifications';
