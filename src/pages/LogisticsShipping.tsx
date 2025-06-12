
import React, { useState } from 'react';
import { useOrders, useUpdateOrder, useTrackingDetection } from '../hooks/useWooCommerce';
import { getTrackingNumber, getTrackingMetaKey } from '@/utils/orderUtils';
import { toast } from 'sonner';
import LogisticsHeader from '@/components/logistics/LogisticsHeader';
import ShipmentTabs from '@/components/logistics/ShipmentTabs';
import TrackingInfoComponent from '@/components/logistics/TrackingInfo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LogisticsShipping = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 50;
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<{orderId: number, trackingNumber: string} | null>(null);

  // Get tracking keys for dynamic key detection
  const { data: trackingKeys } = useTrackingDetection();

  const primaryTrackingKey = trackingKeys?.[0] || '_wot_tracking_number';

  const { data: processingData, isLoading: processingLoading } = useOrders({
    status: 'processing',
    search: searchTerm,
    per_page: perPage,
    page: currentPage,
  });
  const { data: shippedData, isLoading: shippedLoading } = useOrders({
    status: 'completed,delivered,shipped',
    search: searchTerm,
    per_page: perPage,
    page: currentPage,
  });
  const { data: onHoldData, isLoading: onHoldLoading } = useOrders({
    status: 'on-hold',
    search: searchTerm,
    per_page: perPage,
    page: currentPage,
  });

  const { data: inTransitCountData } = useOrders({
    status: 'processing',
    search: searchTerm,
    per_page: 1,
    page: 1,
    meta_key: primaryTrackingKey,
    meta_compare: 'EXISTS'
  });

  const queries = {
    processing: processingData,
    shipped: shippedData,
    onHold: onHoldData,
  };

  // Extract orders from data wrapper
  const processingOrders = processingData?.data || [];
  const shippedOrders = shippedData?.data || [];
  const onHoldOrders = onHoldData?.data || [];

  // Filter orders based on tracking status for proper categorization using imported utility
  const readyToShipOrders = processingOrders.filter(order => !getTrackingNumber(order));
  const inTransitOrders = processingOrders.filter(order => getTrackingNumber(order));

  const processingCount = processingData?.totalRecords || 0;
  const inTransitCount = inTransitCountData?.totalRecords || 0;
  const readyToShipCount = Math.max(processingCount - inTransitCount, 0);
  const onHoldCount = onHoldData?.totalRecords || 0;
  const shippedCount = shippedData?.totalRecords || 0;

  const updateOrderMutation = useUpdateOrder();

  const getShipmentStatus = (order: any) => {
    const tracking = getTrackingNumber(order);
    if (!tracking) return { status: 'No Tracking', color: 'bg-gray-100 text-gray-800' };
    
    if (order.status === 'completed' || order.status === 'delivered') {
      return { status: 'Delivered', color: 'bg-green-100 text-green-800' };
    } else if (order.status === 'shipped') {
      return { status: 'Shipped', color: 'bg-green-100 text-green-800' };
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

    // Find the order to get the correct tracking key
    const order = processingOrders.find(o => o.id === orderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }

    // Use dynamic tracking key detection with priority for _wot_tracking_number
    const trackingKey = getTrackingMetaKey(order, trackingKeys);
    console.log('Using tracking key for order', orderId, ':', trackingKey);

    setUpdatingOrderId(orderId);
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        data: {
          meta_data: [
            {
              id: 0,
              key: trackingKey,
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

  const handleViewTracking = (orderId: number, trackingNumber: string) => {
    setSelectedOrderTracking({ orderId, trackingNumber });
  };

  return (
    <div className="p-6 space-y-6">
      <LogisticsHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <ShipmentTabs
        readyToShipOrders={readyToShipOrders}
        readyToShipCount={readyToShipCount}
        inTransitOrders={inTransitOrders}
        inTransitCount={inTransitCount}
        onHoldOrders={onHoldOrders}
        onHoldCount={onHoldCount}
        shippedOrders={shippedOrders}
        shippedCount={shippedCount}
        processingLoading={processingLoading}
        onHoldLoading={onHoldLoading}
        shippedLoading={shippedLoading}
        trackingInputs={trackingInputs}
        updatingOrderId={updatingOrderId}
        onTrackingInputChange={handleTrackingInputChange}
        onAddTracking={handleAddTracking}
        onViewTracking={handleViewTracking}
        getShipmentStatus={getShipmentStatus}
        processingTotalPages={processingData?.totalPages || 1}
        shippedTotalPages={shippedData?.totalPages || 1}
        onHoldTotalPages={onHoldData?.totalPages || 1}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Enhanced Tracking Dialog */}
      <Dialog open={!!selectedOrderTracking} onOpenChange={() => setSelectedOrderTracking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Tracking Details - Order #{selectedOrderTracking?.orderId}
            </DialogTitle>
          </DialogHeader>
          {selectedOrderTracking && (
            <TrackingInfoComponent
              trackingNumber={selectedOrderTracking.trackingNumber}
              orderId={selectedOrderTracking.orderId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogisticsShipping;
