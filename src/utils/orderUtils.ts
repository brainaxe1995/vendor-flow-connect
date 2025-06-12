
export const getStatusColor = (status: string) => {
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

export const getTrackingNumber = (order: any) => {
  if (!order?.meta_data) return null;
  
  // Enhanced tracking detection - only return values for keys that contain tracking numbers
  const trackingMeta = order.meta_data.find((meta: any) => {
    const key = meta.key?.toLowerCase() || '';
    return (
      (key.includes('number') || key.includes('no') || key === '_wot_tracking_number') &&
      !key.includes('carrier') &&
      !key.includes('provider') &&
      !key.includes('eta')
    );
  });
  
  return trackingMeta?.value || null;
};

export const getTrackingMetaKey = (order: any, trackingKeys?: string[]) => {
  if (!order?.meta_data) {
    // Use detected keys or fallback to legacy key
    return trackingKeys?.[0] || '_wot_tracking_number';
  }
  
  // Look for existing tracking meta in the order - prioritize number keys
  const trackingMeta = order.meta_data.find((meta: any) => {
    const key = meta.key?.toLowerCase() || '';
    return (
      (key.includes('number') || key.includes('no') || key === '_wot_tracking_number') &&
      !key.includes('carrier') &&
      !key.includes('provider') &&
      !key.includes('eta')
    );
  });
  
  if (trackingMeta?.key) {
    return trackingMeta.key;
  }
  
  // If no existing tracking meta, use detected keys or fallback to legacy
  return trackingKeys?.[0] || '_wot_tracking_number';
};
