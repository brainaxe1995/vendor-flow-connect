
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, AlertTriangle, CheckCircle } from 'lucide-react';
import ShipmentTable from './ShipmentTable';
import ShipmentPagination from './ShipmentPagination';

interface ShipmentTabsProps {
  readyToShipOrders: any[];
  inTransitOrders: any[];
  onHoldOrders: any[];
  shippedOrders: any[];
  readyToShipCount?: number;
  inTransitCount?: number;
  onHoldCount?: number;
  shippedCount?: number;
  processingLoading: boolean;
  onHoldLoading: boolean;
  shippedLoading: boolean;
  trackingInputs: Record<number, string>;
  updatingOrderId: number | null;
  onTrackingInputChange: (orderId: number, value: string) => void;
  onAddTracking: (orderId: number) => void;
  onViewTracking?: (orderId: number, trackingNumber: string) => void;
  getShipmentStatus: (order: any) => { status: string; color: string };
  processingTotalPages: number;
  shippedTotalPages: number;
  onHoldTotalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ShipmentTabs: React.FC<ShipmentTabsProps> = ({
  readyToShipOrders,
  inTransitOrders,
  onHoldOrders,
  shippedOrders,
  readyToShipCount,
  inTransitCount,
  onHoldCount,
  shippedCount,
  processingLoading,
  onHoldLoading,
  shippedLoading,
  trackingInputs,
  updatingOrderId,
  onTrackingInputChange,
  onAddTracking,
  onViewTracking,
  getShipmentStatus,
  processingTotalPages,
  shippedTotalPages,
  onHoldTotalPages,
  currentPage,
  onPageChange,
}) => {
  return (
    <Tabs defaultValue="ready-to-ship" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="ready-to-ship" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Ready to Ship <Badge variant="secondary">{(readyToShipCount ?? readyToShipOrders?.length) || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="in-transit" className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          In Transit <Badge variant="secondary">{(inTransitCount ?? inTransitOrders?.length) || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="exceptions" className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Exceptions <Badge variant="destructive">{(onHoldCount ?? onHoldOrders?.length) || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="delivered" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Delivered <Badge variant="secondary">{(shippedCount ?? shippedOrders?.length) || 0}</Badge>
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
            trackingInputs={trackingInputs}
            updatingOrderId={updatingOrderId}
            onTrackingInputChange={onTrackingInputChange}
            onAddTracking={onAddTracking}
            onViewTracking={onViewTracking}
            getShipmentStatus={getShipmentStatus}
          />
          <ShipmentPagination
            totalPages={processingTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
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
          <ShipmentTable
            orders={inTransitOrders}
            isLoading={processingLoading}
            showTracking={true}
            trackingInputs={trackingInputs}
            updatingOrderId={updatingOrderId}
            onTrackingInputChange={onTrackingInputChange}
            onAddTracking={onAddTracking}
            onViewTracking={onViewTracking}
            getShipmentStatus={getShipmentStatus}
          />
          <ShipmentPagination
            totalPages={processingTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
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
          <ShipmentTable
            orders={onHoldOrders}
            isLoading={onHoldLoading}
            trackingInputs={trackingInputs}
            updatingOrderId={updatingOrderId}
            onTrackingInputChange={onTrackingInputChange}
            onAddTracking={onAddTracking}
            onViewTracking={onViewTracking}
            getShipmentStatus={getShipmentStatus}
          />
          <ShipmentPagination
            totalPages={onHoldTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
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
          <ShipmentTable
            orders={shippedOrders}
            isLoading={shippedLoading}
            showTracking={true}
            trackingInputs={trackingInputs}
            updatingOrderId={updatingOrderId}
            onTrackingInputChange={onTrackingInputChange}
            onAddTracking={onAddTracking}
            onViewTracking={onViewTracking}
            getShipmentStatus={getShipmentStatus}
          />
          <ShipmentPagination
            totalPages={shippedTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </CardContent>
      </Card>
    </TabsContent>
    </Tabs>
  );
};

export default ShipmentTabs;
