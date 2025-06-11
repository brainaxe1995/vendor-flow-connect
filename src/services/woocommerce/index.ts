
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

  // Declare method properties that will be bound in constructor
  public getOrders: WooCommerceOrdersService['getOrders'];
  public getOrder: WooCommerceOrdersService['getOrder'];
  public updateOrder: WooCommerceOrdersService['updateOrder'];
  public updateOrderTracking: WooCommerceOrdersService['updateOrderTracking'];
  public getRefunds: WooCommerceOrdersService['getRefunds'];
  public createRefund: WooCommerceOrdersService['createRefund'];
  public detectTrackingMetaKey: WooCommerceOrdersService['detectTrackingMetaKey'];

  public getProducts: WooCommerceProductsService['getProducts'];
  public getProduct: WooCommerceProductsService['getProduct'];
  public updateProduct: WooCommerceProductsService['updateProduct'];
  public getCategories: WooCommerceProductsService['getCategories'];

  public getCustomers: WooCommerceCustomersService['getCustomers'];

  public getSalesReport: WooCommerceReportsService['getSalesReport'];
  public getTopSellersReport: WooCommerceReportsService['getTopSellersReport'];

  public exportData: WooCommerceExportService['exportData'];

  public testConnection: WooCommerceOrdersService['testConnection'];

  constructor() {
    this.ordersService = new WooCommerceOrdersService();
    this.productsService = new WooCommerceProductsService();
    this.customersService = new WooCommerceCustomersService();
    this.reportsService = new WooCommerceReportsService();
    this.exportService = new WooCommerceExportService();

    // Bind all methods after service initialization
    this.getOrders = this.ordersService.getOrders.bind(this.ordersService);
    this.getOrder = this.ordersService.getOrder.bind(this.ordersService);
    this.updateOrder = this.ordersService.updateOrder.bind(this.ordersService);
    this.updateOrderTracking = this.ordersService.updateOrderTracking.bind(this.ordersService);
    this.getRefunds = this.ordersService.getRefunds.bind(this.ordersService);
    this.createRefund = this.ordersService.createRefund.bind(this.ordersService);
    this.detectTrackingMetaKey = this.ordersService.detectTrackingMetaKey.bind(this.ordersService);

    this.getProducts = this.productsService.getProducts.bind(this.productsService);
    this.getProduct = this.productsService.getProduct.bind(this.productsService);
    this.updateProduct = this.productsService.updateProduct.bind(this.productsService);
    this.getCategories = this.productsService.getCategories.bind(this.productsService);

    this.getCustomers = this.customersService.getCustomers.bind(this.customersService);

    this.getSalesReport = this.reportsService.getSalesReport.bind(this.reportsService);
    this.getTopSellersReport = this.reportsService.getTopSellersReport.bind(this.reportsService);

    this.exportData = this.exportService.exportData.bind(this.exportService);

    this.testConnection = this.ordersService.testConnection.bind(this.ordersService);
  }

  setConfig(config: WooCommerceConfig) {
    this.ordersService.setConfig(config);
    this.productsService.setConfig(config);
    this.customersService.setConfig(config);
    this.reportsService.setConfig(config);
    this.exportService.setConfig(config);
  }
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
