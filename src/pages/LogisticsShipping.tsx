
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Truck, Package, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { wooCommerceService } from '../services/woocommerce';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/pagination';
import { toast } from 'sonner';

const LogisticsShipping = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ready-to-ship');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<{[key: number]: string}>({});
  const [updatingOrders, setUpdatingOrders] = useState<Set<number>>(new Set());

  const pagination = usePagination({
    initialPageSize: 20
  });

  // Load orders based on active tab and filters
  const loadOrders = async (page?: number) => {
    setIsLoading(true);
    try {
      const statusMap: {[key: string]: string} = {
        'ready-to-ship': 'processing',
        'in-transit': 'completed',
        'exceptions': 'on-hold',
        'delivered': 'completed'
      };

      const status = statusMap[activeTab];
      const response = await wooCommerceService.getOrdersPaginated({
        status,
        page: page || pagination.currentPage,
        per_page: pagination.pageSize,
        search: searchTerm || undefined
      });

      setOrders(response.data);
      
      // Update pagination with real totals
      if (response.total !== pagination.totalItems) {
        pagination.goToPage(1); // Reset to first page with new data
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders when tab, search, or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, searchTerm ? 500 : 0); // Debounce search

    return () => clearTimeout(timer);
  }, [activeTab, searchTerm, pagination.currentPage, pagination.pageSize]);

  const handleRefresh = () => {
    loadOrders();
    toast.success('Orders refreshed');
  };

  const getTrackingNumber = (order: any) => {
    return wooCommerceService.getTrackingNumber(order);
  };

  const getShipmentStatus = (order: any) => {
    const tracking = getTrackingNumber(order);
    
    if (activeTab === 'ready-to-ship') {
      return tracking 
        ? { status: 'Ready', color: 'bg-green-100 text-green-800' }
        : { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    if (activeTab === 'in-transit') {
      return { status: 'In Transit', color: 'bg-blue-100 text-blue-800' };
    }
    
    if (activeTab === 'exceptions') {
      return { status: 'Exception', color: 'bg-red-100 text-red-800' };
    }
    
    return { status: 'Delivered', color: 'bg-green-100 text-green-800' };
  };

  const handleTrackingInputChange = (orderId: number, value: string) => {
    setTrackingInputs(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  const handleAddTracking = async (orderId: number) => {
    const trackingNumber = trackingInputs[orderId];
    if (!trackingNumber?.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setUpdatingOrders(prev => new Set(prev).add(orderId));
    try {
      await wooCommerceService.updateOrderTracking(orderId, trackingNumber.trim());
      toast.success('Tracking number added successfully');
      
      // Clear the input for this specific order
      setTrackingInputs(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      
      // Reload orders to show updated status
      loadOrders();
    } catch (error) {
      console.error('Add tracking error:', error);
      toast.error('Failed to add tracking number');
    } finally {
      setUpdatingOrders(prev => {
        const updated = new Set(prev);
        updated.delete(orderId);
        return updated;
      });
    }
  };

  const ShipmentTable = ({ showAddTracking = false }: { showAddTracking?: boolean }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading shipments...</span>
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No shipments found
        </div>
      );
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {showAddTracking && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const tracking = getTrackingNumber(order);
              const shipmentStatus = getShipmentStatus(order);
              const isUpdating = updatingOrders.has(order.id);
              const trackingInput = trackingInputs[order.id] || '';

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                      <p className="text-sm text-muted-foreground">{order.billing.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{order.shipping.address_1}</p>
                      <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
                      <p>{order.shipping.country}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tracking ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">{tracking}</code>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={shipmentStatus.color}>
                      {shipmentStatus.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
                  {showAddTracking && (
                    <TableCell>
                      {!tracking ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tracking number"
                            value={trackingInput}
                            onChange={(e) => handleTrackingInputChange(order.id, e.target.value)}
                            className="w-32 text-xs"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddTracking(order.id)}
                            disabled={isUpdating || !trackingInput.trim()}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-green-600">✓ Shipped</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={pagination.goToPage}
            onPageSizeChange={pagination.setPageSize}
            disabled={isLoading}
          />
        </div>
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logistics & Shipping</h1>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ready-to-ship" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ready to Ship
          </TabsTrigger>
          <TabsTrigger value="in-transit" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            In Transit
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Exceptions
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ready-to-ship">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Ship</CardTitle>
              <CardDescription>Orders ready for shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTable showAddTracking={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-transit">
          <Card>
            <CardHeader>
              <CardTitle>In Transit</CardTitle>
              <CardDescription>Orders currently being shipped</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Exceptions</CardTitle>
              <CardDescription>Orders with shipping issues that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
              <CardDescription>Successfully delivered shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsShipping;
