
import { BaseWooCommerceService } from './base';
import { WooCommerceCustomer, WooCommerceResponse } from './types';

export class WooCommerceCustomersService extends BaseWooCommerceService {
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
}
