import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Truck, Package, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useOrders, useUpdateOrder } from '../hooks/useWooCommerce';
import { getTrackingNumber } from '@/utils/orderUtils';
import { toast } from 'sonner';

const LogisticsShipping = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const { data: processingData, isLoading: processingLoading } = useOrders({ 
    status: 'processing',
    search: searchTerm 
  });
  const { data: shippedData, isLoading: shippedLoading } = useOrders({ 
    status: 'completed',
    search: searchTerm 
  });
  const { data: onHoldData, isLoading: onHoldLoading } = useOrders({ 
    status: 'on-hold',
    search: searchTerm 
  });

  // Extract orders from data wrapper
  const processingOrders = processingData?.data || [];
  const shippedOrders = shippedData?.data || [];
  const onHoldOrders = onHoldData?.data || [];

  // Filter orders based on tracking status for proper categorization using imported utility
  const readyToShipOrders = processingOrders.filter(order => !getTrackingNumber(order));
  const inTransitOrders = processingOrders.filter(order => getTrackingNumber(order));

  const updateOrderMutation = useUpdateOrder();

  const getShipmentStatus = (order: any) => {
    const tracking = getTrackingNumber(order);
    if (!tracking) return { status: 'No Tracking', color: 'bg-gray-100 text-gray-800' };
    
    if (order.status === 'completed') {
      return { status: 'Delivered', color: 'bg-green-100 text-green-800' };
    } else if (order.status === 'processing' && tracking) {
      return { status: 'In Transit', color: 'bg-blue-100 text-blue-800' };
    } else if (order.status === 'on-hold') {
      return { status: 'Exception', color: 'bg-red-100 text-red-800' };
    }
    
    return { status: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
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

    setUpdatingOrderId(orderId);
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        data: {
          meta_data: [
            {
              id: 0,
              key: '_tracking_number',
              value: trackingNumber.trim()
            }
          ],
          status: 'processing' // Keep as processing, will show in In Transit tab
        }
      });

      toast.success('Tracking number added successfully');
      // Clear the specific tracking input
      setTrackingInputs(prev => ({
        ...prev,
        [orderId]: ''
      }));
      setUpdatingOrderId(null);
    } catch (error) {
      toast.error('Failed to add tracking number');
      console.error('Add tracking error:', error);
      setUpdatingOrderId(null);
    }
  };

  const ShipmentTable = ({ orders, isLoading, showAddTracking = false }: { 
    orders: any[], 
    isLoading: boolean, 
    showAddTracking?: boolean 
  }) => {
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
            const isUpdating = updatingOrderId === order.id;

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
                          value={trackingInputs[order.id] || ''}
                          onChange={(e) => handleTrackingInputChange(order.id, e.target.value)}
                          className="w-32 text-xs"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleAddTracking(order.id)}
                          disabled={isUpdating || !trackingInputs[order.id]?.trim()}
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
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logistics & Shipping</h1>
        <div className="flex gap-3">
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

      <Tabs defaultValue="ready-to-ship" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ready-to-ship" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ready to Ship <Badge variant="secondary">{readyToShipOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in-transit" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            In Transit <Badge variant="secondary">{inTransitOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Exceptions <Badge variant="destructive">{onHoldOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered <Badge variant="secondary">{shippedOrders?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ready-to-ship">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Ship</CardTitle>
              <CardDescription>Orders ready for shipment (no tracking assigned)</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTable 
                orders={readyToShipOrders} 
                isLoading={processingLoading} 
                showAddTracking={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-transit">
          <Card>
            <CardHeader>
              <CardTitle>In Transit</CardTitle>
              <CardDescription>Orders with tracking numbers being shipped</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTable orders={inTransitOrders} isLoading={processingLoading} />
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
              <ShipmentTable orders={onHoldOrders} isLoading={onHoldLoading} />
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
              <ShipmentTable orders={shippedOrders} isLoading={shippedLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsShipping;
