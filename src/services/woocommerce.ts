
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

class WooCommerceService {
  private config: WooCommerceConfig | null = null;

  setConfig(config: WooCommerceConfig) {
    this.config = config;
  }

  private getAuthString(): string {
    if (!this.config) {
      throw new Error('WooCommerce configuration not set');
    }
    return btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.config) {
      throw new Error('WooCommerce configuration not set');
    }

    const url = `${this.config.storeUrl}/wp-json/wc/v3${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${this.getAuthString()}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Orders API
  async getOrders(params: {
    status?: string;
    per_page?: number;
    page?: number;
    after?: string;
    before?: string;
    search?: string;
  } = {}): Promise<WooCommerceOrder[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const endpoint = `/orders?${queryParams.toString()}`;
    return this.makeRequest(endpoint);
  }

  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async updateOrder(orderId: number, data: Partial<WooCommerceOrder>): Promise<WooCommerceOrder> {
    return this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateOrderTracking(orderId: number, trackingNumber: string, trackingKey?: string): Promise<WooCommerceOrder> {
    const key = trackingKey || '_tracking_number';
    return this.updateOrder(orderId, {
      meta_data: [
        {
          key,
          value: trackingNumber,
        } as any
      ],
    });
  }

  // Products API
  async getProducts(params: {
    status?: string;
    per_page?: number;
    page?: number;
    search?: string;
    stock_status?: string;
  } = {}): Promise<WooCommerceProduct[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const endpoint = `/products?${queryParams.toString()}`;
    return this.makeRequest(endpoint);
  }

  async getProduct(productId: number): Promise<WooCommerceProduct> {
    return this.makeRequest(`/products/${productId}`);
  }

  async updateProduct(productId: number, data: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Reports API
  async getOrdersReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const endpoint = `/reports/orders?${queryParams.toString()}`;
    return this.makeRequest(endpoint);
  }

  async getTopSellersReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const endpoint = `/reports/top_sellers?${queryParams.toString()}`;
    return this.makeRequest(endpoint);
  }

  // Refunds API
  async getRefunds(orderId: number): Promise<any[]> {
    return this.makeRequest(`/orders/${orderId}/refunds`);
  }

  async createRefund(orderId: number, data: {
    amount?: string;
    reason?: string;
    refund_payment?: boolean;
    line_items?: Array<{ id: number; quantity: number; refund_total: string }>;
  }): Promise<any> {
    return this.makeRequest(`/orders/${orderId}/refunds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/orders?per_page=1');
      return true;
    } catch (error) {
      console.error('WooCommerce connection test failed:', error);
      return false;
    }
  }

  // Detect tracking meta key
  async detectTrackingMetaKey(): Promise<string[]> {
    try {
      const orders = await this.getOrders({ per_page: 10 });
      const trackingKeys = new Set<string>();
      
      orders.forEach(order => {
        order.meta_data.forEach(meta => {
          if (meta.key.toLowerCase().includes('tracking')) {
            trackingKeys.add(meta.key);
          }
        });
      });
      
      return Array.from(trackingKeys);
    } catch (error) {
      console.error('Failed to detect tracking meta keys:', error);
      return [];
    }
  }
}

export const wooCommerceService = new WooCommerceService();
