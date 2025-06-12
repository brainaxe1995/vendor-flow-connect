
import { BaseWooCommerceService } from './base';
import { SalesReport, TopSellerReport } from './types';

export class WooCommerceReportsService extends BaseWooCommerceService {
  async getSalesReport(params: {
    period?: string;
    date_min?: string;
    date_max?: string;
    category_id?: number;
  }): Promise<SalesReport> {
    // Format dates to YYYY-MM-DD if they exist as ISO strings
    let formattedParams = { ...params };
    if (params.date_min) {
      formattedParams.date_min = this.formatDateParameter(params.date_min);
    }
    if (params.date_max) {
      formattedParams.date_max = this.formatDateParameter(params.date_max);
    }

    const queryParams = new URLSearchParams();
    Object.entries(formattedParams).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    
    const endpoint = `/reports/sales?${queryParams.toString()}`;
    console.log('Fetching sales report with params:', formattedParams);
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
    
    // Format dates to YYYY-MM-DD if they exist as ISO strings
    let formattedParams = { ...params };
    if (params.date_min) {
      formattedParams.date_min = this.formatDateParameter(params.date_min);
    }
    if (params.date_max) {
      formattedParams.date_max = this.formatDateParameter(params.date_max);
    }
    
    // Set valid per_page limit
    const perPage = Math.min(Math.max(params.per_page || 10, 1), 100);
    queryParams.append('per_page', perPage.toString());
    
    Object.entries(formattedParams).forEach(([key, value]) => {
      if (value && key !== 'per_page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/reports/top_sellers?${queryParams.toString()}`;
    console.log('Fetching top sellers report with params:', formattedParams);
    
    try {
      const response = await this.makeRequest(endpoint);
      return response.json();
    } catch (error) {
      console.error('Failed to fetch top sellers:', error);
      return [];
    }
  }
  
  // Helper to format date parameters for WooCommerce API
  private formatDateParameter(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      // Format as YYYY-MM-DD (WooCommerce expected format)
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid date format:', dateStr, error);
      // Return original if we can't parse it
      return dateStr;
    }
  }
}
