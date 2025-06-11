
import { BaseWooCommerceService } from './base';
import { WooCommerceOrdersService } from './orders';
import { WooCommerceProductsService } from './products';
import { WooCommerceCustomersService } from './customers';

export class WooCommerceExportService extends BaseWooCommerceService {
  private ordersService: WooCommerceOrdersService;
  private productsService: WooCommerceProductsService;
  private customersService: WooCommerceCustomersService;

  constructor() {
    super();
    this.ordersService = new WooCommerceOrdersService();
    this.productsService = new WooCommerceProductsService();
    this.customersService = new WooCommerceCustomersService();
  }

  setConfig(config: any) {
    super.setConfig(config);
    this.ordersService.setConfig(config);
    this.productsService.setConfig(config);
    this.customersService.setConfig(config);
  }

  async exportData(params: {
    type: 'orders' | 'products' | 'customers' | 'refunds';
    format: 'csv' | 'pdf';
    date_min?: string;
    date_max?: string;
    status?: string;
  }): Promise<Blob> {
    let data: any[] = [];
    
    switch (params.type) {
      case 'orders':
        const orders = await this.ordersService.getOrders({
          after: params.date_min,
          before: params.date_max,
          status: params.status,
          per_page: 100
        });
        data = orders.data.map(order => ({
          'Order ID': order.id,
          'Customer': `${order.billing.first_name} ${order.billing.last_name}`,
          'Email': order.billing.email,
          'Total': order.total,
          'Status': order.status,
          'Date': order.date_created
        }));
        break;
      case 'products':
        const products = await this.productsService.getProducts({ per_page: 100 });
        data = products.data.map(product => ({
          'Product ID': product.id,
          'Name': product.name,
          'SKU': product.sku,
          'Price': product.price,
          'Stock': product.stock_quantity,
          'Status': product.status
        }));
        break;
      case 'customers':
        const customers = await this.customersService.getCustomers({
          after: params.date_min,
          before: params.date_max,
          per_page: 100
        });
        data = customers.data.map(customer => ({
          'Customer ID': customer.id,
          'Name': `${customer.first_name} ${customer.last_name}`,
          'Email': customer.email,
          'Date Registered': customer.date_created,
          'Role': customer.role
        }));
        break;
    }

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}
