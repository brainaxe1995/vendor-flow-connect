
import { WooCommerceConfig } from '../../types/woocommerce';

export abstract class BaseWooCommerceService {
  protected config: WooCommerceConfig | null = null;

  setConfig(config: WooCommerceConfig) {
    this.config = config;
    console.log('WooCommerce config updated:', { 
      storeUrl: config.storeUrl, 
      hasKey: !!config.consumerKey,
      hasSecret: !!config.consumerSecret 
    });
  }

  protected getAuthString(): string {
    if (!this.config) {
      throw new Error('WooCommerce configuration not set');
    }
    if (!this.config.consumerKey || !this.config.consumerSecret) {
      throw new Error('WooCommerce API keys not configured');
    }
    return btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);
  }

  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
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

  protected parseHeaders(response: Response) {
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalRecords = parseInt(response.headers.get('X-WP-Total') || '0');
    return { totalPages, totalRecords };
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
