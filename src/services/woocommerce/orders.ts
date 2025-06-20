
import { BaseWooCommerceService } from './base';
import { WooCommerceOrder, WooCommerceResponse } from './types';

export class WooCommerceOrdersService extends BaseWooCommerceService {
  async getOrders(params: {
    status?: string;
    per_page?: number;
    page?: number;
    after?: string;
    before?: string;
    search?: string;
    meta_key?: string;
    meta_compare?: string;
    meta_value?: string;
  } = {}): Promise<WooCommerceResponse<WooCommerceOrder[]>> {
    const queryParams = new URLSearchParams();
    
    const perPage = Math.min(Math.max(params.per_page || 20, 1), 100);
    queryParams.append('per_page', perPage.toString());
    queryParams.append('page', Math.max(params.page || 1, 1).toString());
    
    // Add context=edit to ensure meta_data is included in responses
    queryParams.append('context', 'edit');
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && key !== 'per_page' && key !== 'page') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/orders?${queryParams.toString()}`;
    console.log('Fetching orders with validated params:', {
      ...params,
      per_page: perPage,
      context: 'edit'
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
    const response = await this.makeRequest(`/orders/${orderId}?context=edit`);
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

  async updateOrderTracking(orderId: number, trackingNumber: string, trackingKey: string = '_wot_tracking_number'): Promise<WooCommerceOrder> {
    const updateData = {
      meta_data: [
        {
          id: 0,
          key: trackingKey,
          value: trackingNumber,
        }
      ],
    };
    
    console.log('Updating tracking for order:', orderId, 'with key:', trackingKey, 'value:', trackingNumber);
    return this.updateOrder(orderId, updateData);
  }

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

  async detectTrackingMetaKey(): Promise<string[]> {
    try {
      console.log('Detecting tracking meta keys...');
      const response = await this.getOrders({ per_page: 20 });
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
                  keyLower.includes('aftership') ||
                  keyLower.includes('wot_tracking')) {
                trackingKeys.add(meta.key);
              }
            });
          }
        });
      }
      
      const keys = Array.from(trackingKeys);
      
      // Sort keys to prioritize number keys first
      const sortedKeys = keys.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Prioritize _wot_tracking_number first
        if (aLower === '_wot_tracking_number') return -1;
        if (bLower === '_wot_tracking_number') return 1;
        
        // Then prioritize keys with 'number' or 'no'
        const aHasNumber = aLower.includes('number') || aLower.includes('no');
        const bHasNumber = bLower.includes('number') || bLower.includes('no');
        
        if (aHasNumber && !bHasNumber) return -1;
        if (!aHasNumber && bHasNumber) return 1;
        
        // Then prioritize 'track' keys
        const aHasTrack = aLower.includes('track');
        const bHasTrack = bLower.includes('track');
        
        if (aHasTrack && !bHasTrack) return -1;
        if (!aHasTrack && bHasTrack) return 1;
        
        // Put carrier/provider/eta keys last
        const aIsCarrier = aLower.includes('carrier') || aLower.includes('provider') || aLower.includes('eta');
        const bIsCarrier = bLower.includes('carrier') || bLower.includes('provider') || bLower.includes('eta');
        
        if (!aIsCarrier && bIsCarrier) return -1;
        if (aIsCarrier && !bIsCarrier) return 1;
        
        return 0;
      });
      
      console.log('Detected tracking keys (sorted by priority):', sortedKeys);
      // Return sorted keys or fallback
      return sortedKeys.length > 0 ? sortedKeys : ['_wot_tracking_number', '_tracking_number'];
    } catch (error) {
      console.error('Failed to detect tracking meta keys:', error);
      return ['_wot_tracking_number', '_tracking_number'];
    }
  }
}
