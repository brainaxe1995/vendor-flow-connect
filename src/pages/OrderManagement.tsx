import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useOrders, useUpdateOrder, useTrackingDetection } from '../hooks/useWooCommerce';
import { toast } from 'sonner';
import OrderFilters from '../components/order-management/OrderFilters';
import OrderTable from '../components/order-management/OrderTable';
import OrderDialog from '../components/order-management/OrderDialog';

const OrderManagement = () => {
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

  // Fetch orders for different statuses with proper error handling
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending, error: pendingError } = useOrders({ 
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

  // In Transit logic - orders with tracking numbers
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

  // Extract orders and pagination data from new response format
  const pendingOrders = pendingData?.data || [];
  const processingOrders = processingData?.data || [];
  const onHoldOrders = onHoldData?.data || [];
  const inTransitOrders = inTransitData?.data?.filter(order => getTrackingNumber(order)) || [];
  const completedOrders = completedData?.data || [];
  const cancelledOrders = cancelledData?.data || [];
  const refundedOrders = refundedData?.data || [];
  const failedOrders = failedData?.data || [];
  const pendingPaymentOrders = pendingPaymentData?.data || [];

  // Log data for debugging
  console.log('Order Management Data:', {
    pending: { count: pendingOrders.length, totalPages: pendingData?.totalPages, totalRecords: pendingData?.totalRecords },
    processing: { count: processingOrders.length, totalPages: processingData?.totalPages },
    error: pendingError
  });

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
    
    // Enhanced tracking detection
    const trackingMeta = order.meta_data.find((meta: any) => {
      const key = meta.key.toLowerCase();
      return key.includes('tracking') || 
             key.includes('track') || 
             key.includes('shipment') ||
             key.includes('tracking_number') ||
             key.includes('shipstation') ||
             key.includes('aftership');
    });
    
    return trackingMeta?.value || null;
  };

  const getTrackingMetaKey = (order: any) => {
    if (!order.meta_data) return trackingKeys?.[0] || '_tracking_number';
    
    const trackingMeta = order.meta_data.find((meta: any) => {
      const key = meta.key.toLowerCase();
      return key.includes('tracking') || key.includes('track') || key.includes('shipment');
    });
    
    return trackingMeta?.key || trackingKeys?.[0] || '_tracking_number';
  };

  const handleEditOrder = (order: any) => {
    console.log('Editing order:', order);
    setEditingOrder(order);
    setOrderStatus(order.status);
    setTrackingNumber(getTrackingNumber(order) || '');
    setOrderNotes('');
    setIsDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      const updateData: any = {};
      
      // Update status if changed
      if (orderStatus && orderStatus !== editingOrder.status) {
        updateData.status = orderStatus;
        console.log('Updating status to:', orderStatus);
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
        console.log('Updating tracking:', { key: trackingKey, value: trackingNumber });
      }
      
      // Add order notes if provided
      if (orderNotes) {
        updateData.customer_note = orderNotes;
      }

      console.log('Sending update data:', updateData);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <OrderFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
        />
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
              <CardDescription>
                Orders waiting to be processed • {pendingData?.totalRecords || 0} total records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable 
                orders={pendingOrders} 
                isLoading={pendingLoading} 
                totalPages={pendingData?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Orders</CardTitle>
              <CardDescription>
                Orders currently being prepared • {processingData?.totalRecords || 0} total records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable 
                orders={processingOrders} 
                isLoading={processingLoading} 
                showTracking={true}
                totalPages={processingData?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-transit">
          <Card>
            <CardHeader>
              <CardTitle>In Transit Orders</CardTitle>
              <CardDescription>
                Orders with tracking numbers that are shipped • {inTransitOrders.length} orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable 
                orders={inTransitOrders} 
                isLoading={inTransitLoading} 
                showTracking={true}
                totalPages={inTransitData?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
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
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
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
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
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
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
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
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
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
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
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
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEditOrder={handleEditOrder}
                getStatusColor={getStatusColor}
                getTrackingNumber={getTrackingNumber}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={editingOrder}
        trackingNumber={trackingNumber}
        orderStatus={orderStatus}
        orderNotes={orderNotes}
        onTrackingNumberChange={setTrackingNumber}
        onOrderStatusChange={setOrderStatus}
        onOrderNotesChange={setOrderNotes}
        onSave={handleUpdateOrder}
        isSaving={updateOrderMutation.isPending}
        getTrackingMetaKey={getTrackingMetaKey}
      />
    </div>
  );
};

export default OrderManagement;
