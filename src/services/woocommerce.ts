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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class WooCommerceService {
  private config: WooCommerceConfig | null = null;
  private detectedTrackingKey: string | null = null;

  constructor() {
    // Load config from localStorage on initialization
    this.loadConfigFromStorage();
  }

  private loadConfigFromStorage() {
    try {
      const savedConfig = localStorage.getItem('woocommerce_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.status === 'active') {
          this.setConfig(config);
        }
      }
    } catch (error) {
      console.error('Failed to load config from storage:', error);
    }
  }

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

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.config) {
      throw new Error('WooCommerce configuration not set. Please configure API credentials in Settings.');
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
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract pagination info from headers
      const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      
      return { data, totalItems, totalPages };
    } catch (error) {
      console.error('WooCommerce API request failed:', error);
      throw error;
    }
  }

  // Detect tracking meta key from recent orders
  async detectTrackingMetaKey(): Promise<string> {
    if (this.detectedTrackingKey) {
      return this.detectedTrackingKey;
    }

    try {
      console.log('Detecting tracking meta keys...');
      const response = await this.makeRequest('/orders?per_page=20');
      const orders = response.data;
      
      const trackingKeys = new Set<string>();
      
      orders.forEach((order: WooCommerceOrder) => {
        order.meta_data.forEach(meta => {
          const keyLower = meta.key.toLowerCase();
          if (keyLower.includes('tracking') || keyLower.includes('track') || keyLower.includes('shipment')) {
            trackingKeys.add(meta.key);
          }
        });
      });
      
      const detectedKeys = Array.from(trackingKeys);
      console.log('Detected tracking keys:', detectedKeys);
      
      // Use the first detected key or fallback to default
      this.detectedTrackingKey = detectedKeys[0] || '_tracking_number';
      return this.detectedTrackingKey;
    } catch (error) {
      console.error('Failed to detect tracking meta keys:', error);
      this.detectedTrackingKey = '_tracking_number';
      return this.detectedTrackingKey;
    }
  }

  // Get tracking number from order
  getTrackingNumber(order: WooCommerceOrder): string | null {
    if (!order.meta_data) return null;
    
    // Try detected key first
    if (this.detectedTrackingKey) {
      const meta = order.meta_data.find(m => m.key === this.detectedTrackingKey);
      if (meta) return meta.value;
    }
    
    // Fallback to common tracking keys
    const commonKeys = ['_tracking_number', 'tracking_number', '_shipment_tracking', 'shipment_tracking'];
    for (const key of commonKeys) {
      const meta = order.meta_data.find(m => m.key === key);
      if (meta) return meta.value;
    }
    
    return null;
  }

  // Orders API with pagination
  async getOrdersPaginated(params: {
    status?: string;
    page?: number;
    per_page?: number;
    search?: string;
    after?: string;
    before?: string;
  } = {}): Promise<PaginatedResponse<WooCommerceOrder>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('per_page', (params.per_page || 20).toString());
    queryParams.append('page', (params.page || 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/orders?${queryParams.toString()}`;
    console.log('Fetching paginated orders with params:', params);
    
    const response = await this.makeRequest(endpoint);
    
    return {
      data: response.data,
      total: response.totalItems,
      totalPages: response.totalPages,
      currentPage: params.page || 1,
      pageSize: params.per_page || 20
    };
  }

  // Legacy method for compatibility
  async getOrders(params: any = {}): Promise<WooCommerceOrder[]> {
    const response = await this.getOrdersPaginated(params);
    return response.data;
  }

  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    const response = await this.makeRequest(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrder(orderId: number, data: Partial<WooCommerceOrder>): Promise<WooCommerceOrder> {
    console.log('Updating order:', orderId, data);
    const response = await this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateOrderTracking(orderId: number, trackingNumber: string): Promise<WooCommerceOrder> {
    // Ensure we have detected the tracking key
    const trackingKey = await this.detectTrackingMetaKey();
    
    const updateData = {
      meta_data: [
        {
          key: trackingKey,
          value: trackingNumber,
        }
      ],
    };
    
    console.log('Updating tracking for order:', orderId, 'with key:', trackingKey, 'value:', trackingNumber);
    return this.updateOrder(orderId, updateData);
  }

  // Products API with pagination
  async getProductsPaginated(params: {
    status?: string;
    page?: number;
    per_page?: number;
    search?: string;
    stock_status?: string;
  } = {}): Promise<PaginatedResponse<WooCommerceProduct>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('per_page', (params.per_page || 20).toString());
    queryParams.append('page', (params.page || 1).toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/products?${queryParams.toString()}`;
    console.log('Fetching paginated products with params:', params);
    
    const response = await this.makeRequest(endpoint);
    
    return {
      data: response.data,
      total: response.totalItems,
      totalPages: response.totalPages,
      currentPage: params.page || 1,
      pageSize: params.per_page || 20
    };
  }

  // Legacy method for compatibility
  async getProducts(params: any = {}): Promise<WooCommerceProduct[]> {
    const response = await this.getProductsPaginated(params);
    return response.data;
  }

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
  } = {}): Promise<any> {
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
}

export const wooCommerceService = new WooCommerceService();
