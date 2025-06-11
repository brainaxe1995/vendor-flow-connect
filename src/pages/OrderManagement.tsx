
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
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, Edit, Search, Calendar, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOrders, useUpdateOrder, useTrackingDetection } from '../hooks/useWooCommerce';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const OrderManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: trackingKeys } = useTrackingDetection();
  const updateOrderMutation = useUpdateOrder();

  const perPage = 100;

  // Fetch orders for different statuses with pagination
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = useOrders({ 
    status: 'pending', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const { data: processingData, isLoading: processingLoading, refetch: refetchProcessing } = useOrders({ 
    status: 'processing', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const { data: onHoldData, isLoading: onHoldLoading, refetch: refetchOnHold } = useOrders({ 
    status: 'on-hold', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });

  // In Transit logic - orders with tracking numbers and processing/shipped status
  const { data: inTransitData, isLoading: inTransitLoading, refetch: refetchInTransit } = useOrders({ 
    status: 'processing', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage,
    meta_key: '_tracking_number',
    meta_compare: 'EXISTS'
  });

  const { data: completedData, isLoading: completedLoading } = useOrders({ 
    status: 'completed', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const { data: cancelledData, isLoading: cancelledLoading } = useOrders({ 
    status: 'cancelled', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const { data: refundedData, isLoading: refundedLoading } = useOrders({ 
    status: 'refunded', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const { data: failedData, isLoading: failedLoading } = useOrders({ 
    status: 'failed', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });
  
  const { data: pendingPaymentData, isLoading: pendingPaymentLoading } = useOrders({ 
    status: 'pending-payment', 
    search: searchTerm, 
    per_page: perPage,
    page: currentPage 
  });

  // Extract orders from data wrapper
  const pendingOrders = pendingData?.orders || [];
  const processingOrders = processingData?.orders || [];
  const onHoldOrders = onHoldData?.orders || [];
  const inTransitOrders = inTransitData?.orders?.filter(order => getTrackingNumber(order)) || [];
  const completedOrders = completedData?.orders || [];
  const cancelledOrders = cancelledData?.orders || [];
  const refundedOrders = refundedData?.orders || [];
  const failedOrders = failedData?.orders || [];
  const pendingPaymentOrders = pendingPaymentData?.orders || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'in-transit': 'bg-purple-100 text-purple-800',
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
    
    // Dynamically detect tracking meta key
    const trackingMeta = order.meta_data.find((meta: any) => {
      const key = meta.key.toLowerCase();
      return key.includes('tracking') || key.includes('track') || key.includes('shipment');
    });
    
    return trackingMeta?.value || null;
  };

  const getTrackingMetaKey = (order: any) => {
    if (!order.meta_data) return '_tracking_number';
    
    const trackingMeta = order.meta_data.find((meta: any) => {
      const key = meta.key.toLowerCase();
      return key.includes('tracking') || key.includes('track') || key.includes('shipment');
    });
    
    return trackingMeta?.key || trackingKeys?.[0] || '_tracking_number';
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
      if (trackingNumber !== getTrackingNumber(editingOrder)) {
        const trackingKey = getTrackingMetaKey(editingOrder);
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
      setIsDialogOpen(false);
      setEditingOrder(null);
      setTrackingNumber('');
      setOrderStatus('');
      setOrderNotes('');
      
      // Refetch relevant data
      refetchPending();
      refetchProcessing();
      refetchOnHold();
      refetchInTransit();
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Update order error:', error);
    }
  };

  const handleRefresh = () => {
    refetchPending();
    refetchProcessing();
    refetchOnHold();
    refetchInTransit();
    toast.success('Orders refreshed');
  };

  const OrderTable = ({ 
    orders, 
    isLoading, 
    showTracking = false,
    totalPages = 1 
  }: { 
    orders: any[], 
    isLoading: boolean, 
    showTracking?: boolean,
    totalPages?: number 
  }) => {
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
      <div className="space-y-4">
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
                      <Dialog open={isDialogOpen && editingOrder?.id === order.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingOrder(order);
                              setOrderStatus(order.status);
                              setTrackingNumber(tracking || '');
                              setIsDialogOpen(true);
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
                                <p className="text-xs text-muted-foreground mt-1">
                                  Meta key: {getTrackingMetaKey(order)}
                                </p>
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
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {orders.length} orders shown
        </div>
      </div>
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
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending <Badge variant="secondary">{pendingOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            Processing <Badge variant="secondary">{processingOrders?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in-transit" className="flex items-center gap-2">
            In Transit <Badge variant="secondary">{inTransitOrders?.length || 0}</Badge>
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
              <OrderTable 
                orders={pendingOrders} 
                isLoading={pendingLoading} 
                totalPages={pendingData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={processingOrders} 
                isLoading={processingLoading} 
                showTracking={true}
                totalPages={processingData?.totalPages || 1}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-transit">
          <Card>
            <CardHeader>
              <CardTitle>In Transit Orders</CardTitle>
              <CardDescription>Orders with tracking numbers that are shipped</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable 
                orders={inTransitOrders} 
                isLoading={inTransitLoading} 
                showTracking={true}
                totalPages={inTransitData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={onHoldOrders} 
                isLoading={onHoldLoading}
                totalPages={onHoldData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={completedOrders} 
                isLoading={completedLoading} 
                showTracking={true}
                totalPages={completedData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={cancelledOrders} 
                isLoading={cancelledLoading}
                totalPages={cancelledData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={refundedOrders} 
                isLoading={refundedLoading}
                totalPages={refundedData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={failedOrders} 
                isLoading={failedLoading}
                totalPages={failedData?.totalPages || 1}
              />
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
              <OrderTable 
                orders={pendingPaymentOrders} 
                isLoading={pendingPaymentLoading}
                totalPages={pendingPaymentData?.totalPages || 1}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;
