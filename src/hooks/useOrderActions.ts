
import { useUpdateOrder, useTrackingDetection } from './useWooCommerce';
import { toast } from 'sonner';
import { getTrackingNumber, getTrackingMetaKey } from '../utils/orderUtils';

export const useOrderActions = () => {
  const { data: trackingKeys } = useTrackingDetection();
  const updateOrderMutation = useUpdateOrder();

  const handleUpdateOrder = async (
    editingOrder: any,
    orderStatus: string,
    trackingNumber: string,
    orderNotes: string,
    onSuccess: () => void,
    refetchQueries: () => void
  ) => {
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
        const trackingKey = getTrackingMetaKey(editingOrder, trackingKeys);
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
      onSuccess();
      refetchQueries();
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Update order error:', error);
    }
  };

  const getTrackingMetaKeyForOrder = (order: any) => getTrackingMetaKey(order, trackingKeys);

  return {
    handleUpdateOrder,
    updateOrderMutation,
    trackingKeys,
    getTrackingMetaKey: getTrackingMetaKeyForOrder
  };
};
