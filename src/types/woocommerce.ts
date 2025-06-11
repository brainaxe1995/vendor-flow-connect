
export interface WooCommerceConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  environment: 'live' | 'development';
  permissions: 'read' | 'write';
  status: 'active' | 'inactive';
  lastUsed?: string;
  lastSync?: string;
}

export interface OrderStats {
  pending: number;
  processing: number;
  onHold: number;
  completed: number;
  cancelled: number;
  refunded: number;
  failed: number;
  totalRevenue: number;
  refundRate: number;
}

export interface ProductStats {
  total: number;
  inStock: number;
  outOfStock: number;
  onBackorder: number;
  lowStock: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'delay' | 'refund';
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: number;
  productId?: number;
}
