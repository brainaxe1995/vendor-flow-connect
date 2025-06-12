
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface OrderTabsHeaderProps {
  orderCounts: {
    pending: number;
    processing: number;
    inTransit: number;
    onHold: number;
    completed: number;
    cancelled: number;
    refunded: number;
    failed: number;
    pendingPayment: number;
  };
}

const OrderTabsHeader: React.FC<OrderTabsHeaderProps> = ({ orderCounts }) => {
  return (
    <TabsList className="grid w-full grid-cols-9">
      <TabsTrigger value="processing" className="flex items-center gap-2">
        Processing <Badge variant="secondary">{orderCounts.processing}</Badge>
      </TabsTrigger>
      <TabsTrigger value="pending" className="flex items-center gap-2">
        Pending <Badge variant="secondary">{orderCounts.pending}</Badge>
      </TabsTrigger>
      <TabsTrigger value="in-transit" className="flex items-center gap-2">
        In Transit <Badge variant="secondary">{orderCounts.inTransit}</Badge>
      </TabsTrigger>
      <TabsTrigger value="on-hold" className="flex items-center gap-2">
        On Hold <Badge variant="secondary">{orderCounts.onHold}</Badge>
      </TabsTrigger>
      <TabsTrigger value="completed" className="flex items-center gap-2">
        Completed <Badge variant="secondary">{orderCounts.completed}</Badge>
      </TabsTrigger>
      <TabsTrigger value="cancelled" className="flex items-center gap-2">
        Cancelled <Badge variant="secondary">{orderCounts.cancelled}</Badge>
      </TabsTrigger>
      <TabsTrigger value="refunded" className="flex items-center gap-2">
        Refunded <Badge variant="secondary">{orderCounts.refunded}</Badge>
      </TabsTrigger>
      <TabsTrigger value="failed" className="flex items-center gap-2">
        Failed <Badge variant="secondary">{orderCounts.failed}</Badge>
      </TabsTrigger>
      <TabsTrigger value="pending-payment" className="flex items-center gap-2">
        Pending Payment <Badge variant="secondary">{orderCounts.pendingPayment}</Badge>
      </TabsTrigger>
    </TabsList>
  );
};

export default OrderTabsHeader;
