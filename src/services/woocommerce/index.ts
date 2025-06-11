
import { WooCommerceConfig } from '../../types/woocommerce';
import { WooCommerceOrdersService } from './orders';
import { WooCommerceProductsService } from './products';
import { WooCommerceCustomersService } from './customers';
import { WooCommerceReportsService } from './reports';
import { WooCommerceExportService } from './export';

class WooCommerceService {
  private ordersService: WooCommerceOrdersService;
  private productsService: WooCommerceProductsService;
  private customersService: WooCommerceCustomersService;
  private reportsService: WooCommerceReportsService;
  private exportService: WooCommerceExportService;

  constructor() {
    this.ordersService = new WooCommerceOrdersService();
    this.productsService = new WooCommerceProductsService();
    this.customersService = new WooCommerceCustomersService();
    this.reportsService = new WooCommerceReportsService();
    this.exportService = new WooCommerceExportService();
  }

  setConfig(config: WooCommerceConfig) {
    this.ordersService.setConfig(config);
    this.productsService.setConfig(config);
    this.customersService.setConfig(config);
    this.reportsService.setConfig(config);
    this.exportService.setConfig(config);
  }

  // Orders API
  getOrders = this.ordersService.getOrders.bind(this.ordersService);
  getOrder = this.ordersService.getOrder.bind(this.ordersService);
  updateOrder = this.ordersService.updateOrder.bind(this.ordersService);
  updateOrderTracking = this.ordersService.updateOrderTracking.bind(this.ordersService);
  getRefunds = this.ordersService.getRefunds.bind(this.ordersService);
  createRefund = this.ordersService.createRefund.bind(this.ordersService);
  detectTrackingMetaKey = this.ordersService.detectTrackingMetaKey.bind(this.ordersService);

  // Products API
  getProducts = this.productsService.getProducts.bind(this.productsService);
  getProduct = this.productsService.getProduct.bind(this.productsService);
  updateProduct = this.productsService.updateProduct.bind(this.productsService);
  getCategories = this.productsService.getCategories.bind(this.productsService);

  // Customers API
  getCustomers = this.customersService.getCustomers.bind(this.customersService);

  // Reports API
  getSalesReport = this.reportsService.getSalesReport.bind(this.reportsService);
  getTopSellersReport = this.reportsService.getTopSellersReport.bind(this.reportsService);

  // Export API
  exportData = this.exportService.exportData.bind(this.exportService);

  // Test connection using orders service
  testConnection = this.ordersService.testConnection.bind(this.ordersService);
}

export const wooCommerceService = new WooCommerceService();

// Re-export types for backward compatibility
export type {
  WooCommerceOrder,
  WooCommerceProduct,
  WooCommerceCategory,
  WooCommerceCustomer,
  SalesReport,
  TopSellerReport,
  WooCommerceResponse
} from './types';
