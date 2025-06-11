
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Search, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { useOrders, useUpdateOrder, useTrackingDetection } from '../hooks/useWooCommerce';
import { toast } from 'sonner';

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const { data: trackingKeys } = useTrackingDetection();
  const updateOrderMutation = useUpdateOrder();

  // Fetch orders for different statuses
  const { data: pendingOrders, isLoading: pendingLoading, refetch: refetchPending } = useOrders({ status: 'pending', search: searchTerm });
  const { data: processingOrders, isLoading: processingLoading, refetch: refetchProcessing } = useOrders({ status: 'processing', search: searchTerm });
  const { data: onHoldOrders, isLoading: onHoldLoading, refetch: refetchOnHold } = useOrders({ status: 'on-hold', search: searchTerm });
  const { data: completedOrders, isLoading: completedLoading } = useOrders({ status: 'completed', search: searchTerm });
  const { data: cancelledOrders, isLoading: cancelledLoading } = useOrders({ status: 'cancelled', search: searchTerm });
  const { data: refundedOrders, isLoading: refundedLoading } = useOrders({ status: 'refunded', search: searchTerm });
  const { data: failedOrders, isLoading: failedLoading } = useOrders({ status: 'failed', search: searchTerm });
  const { data: pendingPaymentOrders, isLoading: pendingPaymentLoading } = useOrders({ status: 'pending-payment', search: searchTerm });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
      'pending-payment': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTrackingNumber = (order: any) => {
    if (!order.meta_data) return null;
    
    // Try to find tracking number using detected keys or common patterns
    const trackingMeta = order.meta_data.find((meta: any) => {
      const key = meta.key.toLowerCase();
      return key.includes('tracking') || key.includes('track') || key.includes('shipment');
    });
    
    return trackingMeta?.value || null;
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      const updateData: any = {};
      
      // Update status if changed
      if (orderStatus && orderStatus !== editingOrder.status) {
        updateData.status = orderStatus;
      }
      
      // Update tracking number if provided
      if (trackingNumber) {
        const trackingKey = trackingKeys?.[0] || '_tracking_number';
        updateData.meta_data = [
          {
            key: trackingKey,
            value: trackingNumber
          }
        ];
      }
      
      // Add order notes if provided
      if (orderNotes) {
        updateData.customer_note = orderNotes;
      }

      await updateOrderMutation.mutateAsync({
        orderId: editingOrder.id,
        data: updateData
      });

      toast.success('Order updated successfully');
      setEditingOrder(null);
      setTrackingNumber('');
      setOrderStatus('');
      setOrderNotes('');
      
      // Refetch relevant data
      refetchPending();
      refetchProcessing();
      refetchOnHold();
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Update order error:', error);
    }
  };

  const OrderTable = ({ orders, isLoading, showTracking = false }: { orders: any[], isLoading: boolean, showTracking?: boolean }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading orders...</span>
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No orders found
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            {showTracking && <TableHead>Tracking</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const tracking = getTrackingNumber(order);
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                    <p className="text-sm text-muted-foreground">{order.billing.email}</p>
                  </div>
                </TableCell>
                <TableCell>{order.line_items.length}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
                {showTracking && (
                  <TableCell>
                    {tracking ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">{tracking}</code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditingOrder(order);
                            setOrderStatus(order.status);
                            setTrackingNumber(tracking || '');
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Update Order #{order.id}</DialogTitle>
                          <DialogDescription>
                            Manage order status, tracking, and communications
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="tracking">Tracking Number</Label>
                              <Input 
                                id="tracking" 
                                placeholder="Enter tracking number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="status">Order Status</Label>
                              <Select value={orderStatus} onValueChange={setOrderStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                  <SelectItem value="refunded">Refunded</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="notes">Order Notes</Label>
                            <Textarea 
                              id="notes" 
                              placeholder="Add notes about this order..."
                              value={orderNotes}
                              onChange={(e) => setOrderNotes(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingOrder(null)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleUpdateOrder}
                              disabled={updateOrderMutation.isPending}
                            >
                              {updateOrderMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
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
        <h1 className="text-3xl font-bold">Order Management</h1>
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
          <Button variant="outline" onClick={() => {
            refetchPending();
            refetchProcessing();
            refetchOnHold();
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending <Badge variant="secondary">{pendingOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            Processing <Badge variant="secondary">{processingOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="on-hold" className="flex items-center gap-2">
            On Hold <Badge variant="secondary">{onHoldOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Completed <Badge variant="secondary">{completedOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            Cancelled <Badge variant="secondary">{cancelledOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="refunded" className="flex items-center gap-2">
            Refunded <Badge variant="secondary">{refundedOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            Failed <Badge variant="secondary">{failedOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending-payment" className="flex items-center gap-2">
            Payment <Badge variant="secondary">{pendingPaymentOrders?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders waiting to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={pendingOrders || []} isLoading={pendingLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Orders</CardTitle>
              <CardDescription>Orders currently being prepared</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={processingOrders || []} isLoading={processingLoading} showTracking={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="on-hold">
          <Card>
            <CardHeader>
              <CardTitle>Orders On Hold</CardTitle>
              <CardDescription>Orders that require attention</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={onHoldOrders || []} isLoading={onHoldLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>Successfully fulfilled orders</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={completedOrders || []} isLoading={completedLoading} showTracking={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Orders</CardTitle>
              <CardDescription>Orders that have been cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={cancelledOrders || []} isLoading={cancelledLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunded">
          <Card>
            <CardHeader>
              <CardTitle>Refunded Orders</CardTitle>
              <CardDescription>Orders that have been refunded</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={refundedOrders || []} isLoading={refundedLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Orders</CardTitle>
              <CardDescription>Orders that have failed processing</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={failedOrders || []} isLoading={failedLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-payment">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payment</CardTitle>
              <CardDescription>Orders waiting for payment</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={pendingPaymentOrders || []} isLoading={pendingPaymentLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;
