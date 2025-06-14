
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, AlertTriangle, DollarSign, TrendingUp, Bell, Settings, Loader2 } from 'lucide-react';
import { useOrderStats, useProductStats, useWooCommerceConfig, useTopSellingProducts } from '../hooks/useWooCommerce';
import { useSupabaseNotifications } from '../hooks/useSupabaseNotifications';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { config, isConfigured, loading: configLoading } = useWooCommerceConfig();
  const { data: orderStats, isLoading: orderStatsLoading, error: orderStatsError } = useOrderStats();
  const { data: productStats, isLoading: productStatsLoading, error: productStatsError } = useProductStats();
  const { notifications } = useSupabaseNotifications();
  
  const allTimeRange = {
    date_min: '2000-01-01',
    date_max: new Date().toISOString().split('T')[0]
  };
  const { data: topSellers = [], isLoading: topSellersLoading } = useTopSellingProducts({
    per_page: 10,
    ...allTimeRange
  });

  useEffect(() => {
    if (!configLoading && !isConfigured) {
      toast.error('WooCommerce not configured. Please configure your API credentials in Settings.');
    } else if (!configLoading && (orderStatsError || productStatsError)) {
      toast.error('Failed to load store data. Please check your API configuration.');
    }
  }, [isConfigured, orderStatsError, productStatsError, configLoading]);

  const recentNotifications = (notifications || []).slice(0, 3);

  if (configLoading) {
    return (
      <div className="p-6 space-y-6 text-center">
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading configuration...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">WooCommerce Not Configured</h2>
          <p className="text-muted-foreground mb-6">
            Please configure your WooCommerce API credentials to start using the portal.
          </p>
          <Link to="/settings">
            <Button className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure WooCommerce API
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStatsLoading ? '...' : orderStats?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStatsLoading ? '...' : orderStats?.processing || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Being prepared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStatsLoading ? '...' : orderStats?.onHold || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStatsLoading ? '...' : orderStats?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue and Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${orderStatsLoading ? '...' : orderStats?.totalRevenue?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                From all orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {productStatsLoading ? '...' : productStats?.lowStock || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Products need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Selling Products
            </CardTitle>
            <CardDescription>
              Best performing products this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading top sellers...</p>
                </div>
              ) : topSellers && topSellers.length > 0 ? (
                topSellers.slice(0, 10).map((product, index) => (
                  <div key={`${product.id}-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{product.quantity} sold</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sales data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            Latest updates and alerts from your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'order' ? 'bg-blue-500' :
                    notification.type === 'stock' ? 'bg-red-500' : 
                    notification.type === 'delay' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notification.time).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent notifications
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
