
// Re-export everything from the new modular structure for backward compatibility
export { wooCommerceService } from './woocommerce/index';
export type {
  WooCommerceOrder,
  WooCommerceProduct,
  WooCommerceCategory,
  WooCommerceCustomer,
  SalesReport,
  TopSellerReport,
  WooCommerceResponse
} from './woocommerce/types';
