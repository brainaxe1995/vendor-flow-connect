import { WooCommerceConfig } from '../types/woocommerce';

export interface WooCommerceOrder {
  id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  total: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    price: string;
    total: string;
  }>;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  stock_status: string;
  manage_stock: boolean;
  sku: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    src: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
}

export interface WooCommerceCustomer {
  id: number;
  date_created: string;
  date_modified: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
}

export interface SalesReport {
  total_sales: string;
  net_sales: string;
  average_sales: string;
  total_orders: number;
  total_items: number;
  total_tax: string;
  total_shipping: string;
  total_refunds: string;
  total_discount: string;
  totals_grouped_by: string;
  totals: {
    [key: string]: {
      sales: string;
      orders: number;
      items: number;
      tax: string;
      shipping: string;
      discount: string;
      customers: number;
    };
  };
}

export interface TopSellerReport {
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: string;
}

export interface WooCommerceResponse<T> {
  data: T;
  totalPages: number;
  totalRecords: number;
  hasMore: boolean;
}

class WooCommerceService {
  private config: WooCommerceConfig | null = null;

  setConfig(config: WooCommerceConfig) {
    this.config = config;
    console.log('WooCommerce config updated:', { 
      storeUrl: config.storeUrl, 
      hasKey: !!config.consumerKey,
      hasSecret: !!config.consumerSecret 
    });
  }

  private getAuthString(): string {
    if (!this.config) {
      throw new Error('WooCommerce configuration not set');
    }
    if (!this.config.consumerKey || !this.config.consumerSecret) {
      throw new Error('WooCommerce API keys not configured');
    }
    return btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.config) {
      throw new Error('WooCommerce configuration not set. Please configure API credentials in Settings.');
    }

    if (!this.config.storeUrl) {
      throw new Error('Store URL not configured');
    }

    const url = `${this.config.storeUrl.replace(/\/$/, '')}/wp-json/wc/v3${endpoint}`;
    
    console.log('Making API request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Basic ${this.getAuthString()}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url,
          errorText
        });
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response;
    } catch (error) {
      console.error('WooCommerce API request failed:', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private parseHeaders(response: Response) {
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalRecords = parseInt(response.headers.get('X-WP-Total') || '0');
    return { totalPages, totalRecords };
  }

  // Orders API with proper pagination and validation
  async getOrders(params: {
    status?: string;
    per_page?: number;
    page?: number;
    after?: string;
    before?: string;
    search?: string;
    meta_key?: string;
    meta_compare?: string;
  } = {}): Promise<WooCommerceResponse<WooCommerceOrder[]>> {
    const queryParams = new URLSearchParams();
    
    // Fixed: Ensure per_page is within valid limits (1-100)
    const perPage = Math.min(Math.max(params.per_page || 20, 1), 100);
    queryParams.append('per_page', perPage.toString());
    queryParams.append('page', Math.max(params.page || 1, 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/orders?${queryParams.toString()}`;
    console.log('Fetching orders with validated params:', {
      ...params,
      per_page: perPage
    });
    
    const response = await this.makeRequest(endpoint);
    const data = await response.json();
    const { totalPages, totalRecords } = this.parseHeaders(response);
    
    return {
      data: Array.isArray(data) ? data : [],
      totalPages,
      totalRecords,
      hasMore: (params.page || 1) < totalPages
    };
  }

  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    const response = await this.makeRequest(`/orders/${orderId}`);
    return response.json();
  }

  async updateOrder(orderId: number, data: Partial<WooCommerceOrder>): Promise<WooCommerceOrder> {
    console.log('Updating order:', orderId, data);
    const response = await this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateOrderTracking(orderId: number, trackingNumber: string, trackingKey?: string): Promise<WooCommerceOrder> {
    const key = trackingKey || '_tracking_number';
    const updateData = {
      meta_data: [
        {
          id: 0, // WooCommerce will assign the actual ID
          key,
          value: trackingNumber,
        }
      ],
    };
    
    console.log('Updating tracking for order:', orderId, 'with key:', key, 'value:', trackingNumber);
    return this.updateOrder(orderId, updateData);
  }

  // Products API with proper pagination and validation
  async getProducts(params: {
    status?: string;
    per_page?: number;
    page?: number;
    search?: string;
    stock_status?: string;
  } = {}): Promise<WooCommerceResponse<WooCommerceProduct[]>> {
    const queryParams = new URLSearchParams();
    
    // Fixed: Ensure per_page is within valid limits (1-100)
    const perPage = Math.min(Math.max(params.per_page || 20, 1), 100);
    queryParams.append('per_page', perPage.toString());
    queryParams.append('page', Math.max(params.page || 1, 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/products?${queryParams.toString()}`;
    console.log('Fetching products with validated params:', {
      ...params,
      per_page: perPage
    });
    
    const response = await this.makeRequest(endpoint);
    const data = await response.json();
    const { totalPages, totalRecords } = this.parseHeaders(response);
    
    return {
      data: Array.isArray(data) ? data : [],
      totalPages,
      totalRecords,
      hasMore: (params.page || 1) < totalPages
    };
  }

  async getProduct(productId: number): Promise<WooCommerceProduct> {
    const response = await this.makeRequest(`/products/${productId}`);
    return response.json();
  }

  async updateProduct(productId: number, data: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
    console.log('Updating product:', productId, data);
    const response = await this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Categories API with validation
  async getCategories(params: {
    per_page?: number;
    page?: number;
    search?: string;
    parent?: number;
    exclude?: number[];
    include?: number[];
    order?: 'asc' | 'desc';
    orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
    hide_empty?: boolean;
  } = {}): Promise<WooCommerceResponse<WooCommerceCategory[]>> {
    const queryParams = new URLSearchParams();
    
    // Fixed: Ensure per_page is within valid limits (1-100)
    const perPage = Math.min(Math.max(params.per_page || 20, 1), 100);
    queryParams.append('per_page', perPage.toString());
    queryParams.append('page', Math.max(params.page || 1, 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && key !== 'per_page' && key !== 'page') {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const endpoint = `/products/categories?${queryParams.toString()}`;
    console.log('Fetching categories with validated params:', {
      ...params,
      per_page: perPage
    });
    
    const response = await this.makeRequest(endpoint);
    const data = await response.json();
    const { totalPages, totalRecords } = this.parseHeaders(response);
    
    return {
      data: Array.isArray(data) ? data : [],
      totalPages,
      totalRecords,
      hasMore: (params.page || 1) < totalPages
    };
  }

  // Customers API with validation
  async getCustomers(params: {
    per_page?: number;
    page?: number;
    search?: string;
    email?: string;
    include?: number[];
    exclude?: number[];
    orderby?: 'id' | 'include' | 'name' | 'registered_date';
    order?: 'asc' | 'desc';
    after?: string;
    before?: string;
    role?: string;
  } = {}): Promise<WooCommerceResponse<WooCommerceCustomer[]>> {
    const queryParams = new URLSearchParams();
    
    // Fixed: Ensure per_page is within valid limits (1-100)
    const perPage = Math.min(Math.max(params.per_page || 20, 1), 100);
    queryParams.append('per_page', perPage.toString());
    queryParams.append('page', Math.max(params.page || 1, 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && key !== 'per_page' && key !== 'page') {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const endpoint = `/customers?${queryParams.toString()}`;
    console.log('Fetching customers with validated params:', {
      ...params,
      per_page: perPage
    });
    
    const response = await this.makeRequest(endpoint);
    const data = await response.json();
    const { totalPages, totalRecords } = this.parseHeaders(response);
    
    return {
      data: Array.isArray(data) ? data : [],
      totalPages,
      totalRecords,
      hasMore: (params.page || 1) < totalPages
    };
  }

  // Enhanced Reports API
  async getSalesReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
    category_id?: number;
  } = {}): Promise<SalesReport> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    
    const endpoint = `/reports/sales?${queryParams.toString()}`;
    console.log('Fetching sales report with params:', params);
    const response = await this.makeRequest(endpoint);
    return response.json();
  }

  async getTopSellersReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
    per_page?: number;
  } = {}): Promise<TopSellerReport[]> {
    const queryParams = new URLSearchParams();
    
    // Fixed: Ensure per_page is within valid limits
    const perPage = Math.min(Math.max(params.per_page || 10, 1), 100);
    queryParams.append('per_page', perPage.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/reports/top_sellers?${queryParams.toString()}`;
    console.log('Fetching top sellers report with validated params:', {
      ...params,
      per_page: perPage
    });
    const response = await this.makeRequest(endpoint);
    return response.json();
  }

  // Refunds API
  async getRefunds(orderId: number): Promise<any[]> {
    const response = await this.makeRequest(`/orders/${orderId}/refunds`);
    return response.json();
  }

  async createRefund(orderId: number, data: {
    amount?: string;
    reason?: string;
    refund_payment?: boolean;
    line_items?: Array<{ id: number; quantity: number; refund_total: string }>;
  }): Promise<any> {
    console.log('Creating refund for order:', orderId, data);
    const response = await this.makeRequest(`/orders/${orderId}/refunds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing WooCommerce connection...');
      await this.makeRequest('/orders?per_page=1');
      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('WooCommerce connection test failed:', error);
      return false;
    }
  }

  // Enhanced tracking meta key detection
  async detectTrackingMetaKey(): Promise<string[]> {
    try {
      console.log('Detecting tracking meta keys...');
      const response = await this.getOrders({ per_page: 20 }); // Fixed: Use valid per_page
      const trackingKeys = new Set<string>();
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(order => {
          if (order.meta_data && Array.isArray(order.meta_data)) {
            order.meta_data.forEach(meta => {
              const keyLower = meta.key.toLowerCase();
              if (keyLower.includes('tracking') || 
                  keyLower.includes('track') || 
                  keyLower.includes('shipment') ||
                  keyLower.includes('tracking_number') ||
                  keyLower.includes('shipstation') ||
                  keyLower.includes('aftership')) {
                trackingKeys.add(meta.key);
              }
            });
          }
        });
      }
      
      const keys = Array.from(trackingKeys);
      console.log('Detected tracking keys:', keys);
      return keys.length > 0 ? keys : ['_tracking_number'];
    } catch (error) {
      console.error('Failed to detect tracking meta keys:', error);
      return ['_tracking_number'];
    }
  }

  // Export functionality
  async exportData(params: {
    type: 'orders' | 'products' | 'customers' | 'refunds';
    format: 'csv' | 'pdf';
    date_min?: string;
    date_max?: string;
    status?: string;
  }): Promise<Blob> {
    // This would typically generate and return export data
    // For now, we'll create a simple CSV export
    let data: any[] = [];
    
    switch (params.type) {
      case 'orders':
        const orders = await this.getOrders({
          after: params.date_min,
          before: params.date_max,
          status: params.status,
          per_page: 100 // Fixed: Use valid per_page
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
        const products = await this.getProducts({ per_page: 100 }); // Fixed: Use valid per_page
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
        const customers = await this.getCustomers({
          after: params.date_min,
          before: params.date_max,
          per_page: 100 // Fixed: Use valid per_page
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

    // Convert to CSV
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

export const wooCommerceService = new WooCommerceService();

}
