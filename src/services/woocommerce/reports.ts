
import { BaseWooCommerceService } from './base';
import { SalesReport, TopSellerReport } from './types';

export class WooCommerceReportsService extends BaseWooCommerceService {
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
}
