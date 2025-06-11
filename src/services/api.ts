
// API service layer for WooCommerce and 17track integration
const WOOCOMMERCE_BASE_URL = process.env.REACT_APP_WOOCOMMERCE_URL || 'https://your-store.com/wp-json/wc/v3';
const WOOCOMMERCE_KEY = process.env.REACT_APP_WOOCOMMERCE_KEY || 'your_consumer_key';
const WOOCOMMERCE_SECRET = process.env.REACT_APP_WOOCOMMERCE_SECRET || 'your_consumer_secret';
const TRACK17_API_KEY = process.env.REACT_APP_17TRACK_API_KEY || 'your_17track_key';

// WooCommerce API functions
export const wooCommerceAPI = {
  // Orders
  getOrders: async (status?: string) => {
    const url = new URL(`${WOOCOMMERCE_BASE_URL}/orders`);
    if (status) url.searchParams.append('status', status);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${btoa(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`)}`
      }
    });
    return response.json();
  },

  updateOrder: async (orderId: string, data: any) => {
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Products
  getProducts: async () => {
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products`, {
      headers: {
        'Authorization': `Basic ${btoa(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`)}`
      }
    });
    return response.json();
  },

  updateProduct: async (productId: string, data: any) => {
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Refunds
  getRefunds: async (orderId?: string) => {
    const url = orderId 
      ? `${WOOCOMMERCE_BASE_URL}/orders/${orderId}/refunds`
      : `${WOOCOMMERCE_BASE_URL}/refunds`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`)}`
      }
    });
    return response.json();
  },

  createRefund: async (orderId: string, data: any) => {
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/orders/${orderId}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// 17track API functions
export const track17API = {
  trackPackage: async (trackingNumber: string, carrier?: string) => {
    const response = await fetch('https://api.17track.net/track/v2.2/register', {
      method: 'POST',
      headers: {
        '17token': TRACK17_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        number: trackingNumber,
        carrier: carrier || 0
      }])
    });
    return response.json();
  },

  getTrackingInfo: async (trackingNumbers: string[]) => {
    const response = await fetch('https://api.17track.net/track/v2.2/gettrackinfo', {
      method: 'POST',
      headers: {
        '17token': TRACK17_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trackingNumbers.map(num => ({ number: num })))
    });
    return response.json();
  }
};

// Mock data for development
export const mockData = {
  orders: [
    { 
      id: '12345', 
      customer: 'John Doe', 
      products: 3, 
      total: '$299.99', 
      date: '2024-01-15', 
      status: 'new',
      tracking: '',
      items: [
        { name: 'Premium Wireless Headphones', quantity: 1, price: 199.99 },
        { name: 'USB-C Cable', quantity: 2, price: 50.00 }
      ]
    },
    // Add more mock orders...
  ],
  products: [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      sku: 'PWH-001',
      price: 199.99,
      stock: 45,
      status: 'active',
      images: ['/placeholder.svg'],
      variants: [
        { name: 'Black', sku: 'PWH-001-BLK', stock: 25 },
        { name: 'White', sku: 'PWH-001-WHT', stock: 20 }
      ]
    },
    // Add more mock products...
  ]
};
