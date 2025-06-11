
import { BaseWooCommerceService } from './base';
import { WooCommerceProduct, WooCommerceCategory, WooCommerceResponse } from './types';

export class WooCommerceProductsService extends BaseWooCommerceService {
  async getProducts(params: {
    status?: string;
    per_page?: number;
    page?: number;
    search?: string;
    stock_status?: string;
  } = {}): Promise<WooCommerceResponse<WooCommerceProduct[]>> {
    const queryParams = new URLSearchParams();
    
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
}
