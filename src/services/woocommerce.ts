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

export interface TopSellerReport {
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: string;
}

class WooCommerceService {
  private config: WooCommerceConfig | null = null;

  constructor() {
    // Load configuration from localStorage on initialization
    this.loadConfigFromStorage();
  }

  private loadConfigFromStorage() {
    try {
      const savedConfig = localStorage.getItem('woocommerce_config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        this.setConfig(parsedConfig);
        console.log('WooCommerce config loaded from storage:', {
          storeUrl: parsedConfig.storeUrl,
          hasKey: !!parsedConfig.consumerKey,
          hasSecret: !!parsedConfig.consumerSecret,
          status: parsedConfig.status
        });
      }
    } catch (error) {
      console.error('Failed to load WooCommerce config from storage:', error);
      localStorage.removeItem('woocommerce_config');
    }
  }

  setConfig(config: WooCommerceConfig) {
    this.config = config;
    console.log('WooCommerce config updated:', { 
      storeUrl: config.storeUrl, 
      hasKey: !!config.consumerKey,
      hasSecret: !!config.consumerSecret,
      status: config.status
    });
  }

  getConfig(): WooCommerceConfig | null {
    return this.config;
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

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Ensure we have the latest config from storage
    if (!this.config) {
      this.loadConfigFromStorage();
    }

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
          url,
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response successful:', { endpoint, dataLength: Array.isArray(data) ? data.length : 'object' });
      return data;
    } catch (error) {
      console.error('WooCommerce API request failed:', { url, error });
      throw error;
    }
  }

  // Orders API with pagination support
  async getOrders(params: {
    status?: string;
    per_page?: number;
    page?: number;
    after?: string;
    before?: string;
    search?: string;
  } = {}): Promise<WooCommerceOrder[]> {
    const queryParams = new URLSearchParams();
    
    // Default pagination
    queryParams.append('per_page', (params.per_page || 20).toString());
    queryParams.append('page', (params.page || 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/orders?${queryParams.toString()}`;
    console.log('Fetching orders with params:', params);
    return this.makeRequest(endpoint);
  }

  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async updateOrder(orderId: number, data: Partial<WooCommerceOrder>): Promise<WooCommerceOrder> {
    console.log('Updating order:', orderId, data);
    return this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Enhanced tracking update with proper metadata handling
  async updateOrderTracking(orderId: number, trackingNumber: string, trackingKey?: string): Promise<WooCommerceOrder> {
    let detectedKey = trackingKey;
    
    // If no key provided, try to detect from existing order data
    if (!detectedKey) {
      try {
        const order = await this.getOrder(orderId);
        const trackingMeta = order.meta_data.find(meta => {
          const key = meta.key.toLowerCase();
          return key.includes('tracking') || key.includes('track') || key.includes('shipment');
        });
        detectedKey = trackingMeta?.key || '_tracking_number';
      } catch (error) {
        console.warn('Could not detect existing tracking key, using default:', error);
        detectedKey = '_tracking_number';
      }
    }
    
    // Get the current order to check for existing metadata
    const currentOrder = await this.getOrder(orderId);
    const existingMeta = currentOrder.meta_data.find(meta => meta.key === detectedKey);
    
    let updateData;
    
    if (existingMeta) {
      // Update existing metadata with proper id
      updateData = {
        meta_data: [
          {
            id: existingMeta.id,
            key: detectedKey,
            value: trackingNumber,
          }
        ],
      };
    } else {
      // For new metadata, we use a different approach - just the key/value without id
      // WooCommerce will auto-assign an id when creating new metadata
      updateData = {
        meta_data: [
          {
            key: detectedKey,
            value: trackingNumber,
          }
        ],
      };
    }
    
    console.log('Updating tracking for order:', orderId, 'with key:', detectedKey, 'value:', trackingNumber);
    return this.updateOrder(orderId, updateData as Partial<WooCommerceOrder>);
  }

  // Products API with pagination
  async getProducts(params: {
    status?: string;
    per_page?: number;
    page?: number;
    search?: string;
    stock_status?: string;
  } = {}): Promise<WooCommerceProduct[]> {
    const queryParams = new URLSearchParams();
    
    // Default pagination
    queryParams.append('per_page', (params.per_page || 20).toString());
    queryParams.append('page', (params.page || 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/products?${queryParams.toString()}`;
    console.log('Fetching products with params:', params);
    return this.makeRequest(endpoint);
  }

  async getProduct(productId: number): Promise<WooCommerceProduct> {
    return this.makeRequest(`/products/${productId}`);
  }

  async updateProduct(productId: number, data: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
    console.log('Updating product:', productId, data);
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
      if (value) queryParams.append(key, String(value));
    });
    
    const endpoint = `/reports/orders?${queryParams.toString()}`;
    return this.makeRequest(endpoint);
  }

  async getTopSellersReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
    per_page?: number;
  } = {}): Promise<TopSellerReport[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('per_page', (params.per_page || 10).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/reports/top_sellers?${queryParams.toString()}`;
    console.log('Fetching top sellers report');
    return this.makeRequest(endpoint);
  }

  async getSalesReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    
    const endpoint = `/reports/sales?${queryParams.toString()}`;
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
    console.log('Creating refund for order:', orderId, data);
    return this.makeRequest(`/orders/${orderId}/refunds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  // Detect tracking meta key from recent orders
  async detectTrackingMetaKey(): Promise<string[]> {
    try {
      console.log('Detecting tracking meta keys...');
      const orders = await this.getOrders({ per_page: 20 });
      const trackingKeys = new Set<string>();
      
      orders.forEach(order => {
        order.meta_data.forEach(meta => {
          const keyLower = meta.key.toLowerCase();
          if (keyLower.includes('tracking') || keyLower.includes('track') || keyLower.includes('shipment')) {
            trackingKeys.add(meta.key);
          }
        });
      });
      
      const keys = Array.from(trackingKeys);
      console.log('Detected tracking keys:', keys);
      return keys.length > 0 ? keys : ['_tracking_number']; // Default fallback
    } catch (error) {
      console.error('Failed to detect tracking meta keys:', error);
      return ['_tracking_number']; // Default fallback
    }
  }
}

export const wooCommerceService = new WooCommerceService();

}
