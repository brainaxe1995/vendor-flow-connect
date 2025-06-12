
import { useState } from 'react';
import { getTrackingNumber } from '../utils/orderUtils';

export const useOrderDialog = () => {
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditOrder = (order: any) => {
    console.log('Editing order:', order);
    setEditingOrder(order);
    setOrderStatus(order.status || '');
    setTrackingNumber(getTrackingNumber(order) || '');
    setOrderNotes('');
    setIsDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingOrder(null);
    setTrackingNumber('');
    setOrderStatus('');
    setOrderNotes('');
  };

  return {
    editingOrder,
    trackingNumber,
    setTrackingNumber,
    orderStatus,
    setOrderStatus,
    orderNotes,
    setOrderNotes,
    isDialogOpen,
    setIsDialogOpen,
    handleEditOrder,
    resetDialog
  };
};
