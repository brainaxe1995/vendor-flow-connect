
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
import { AlertTriangle, Package, Truck, Upload, Calendar, Clock, MapPin, FileText } from 'lucide-react';

const LogisticsShipping = () => {
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Mock tracking data with 17track integration
  const trackingData = {
    active: [
      { 
        id: 'TN123456789', 
        order: '#12345', 
        customer: 'John Doe', 
        carrier: 'FedEx', 
        status: 'in-transit',
        lastUpdate: '2024-01-15 10:30',
        location: 'Los Angeles, CA',
        estimatedDelivery: '2024-01-18',
        noMovementDays: 1
      },
      { 
        id: 'TN123456790', 
        order: '#12346', 
        customer: 'Jane Smith', 
        carrier: 'UPS', 
        status: 'customs-delay',
        lastUpdate: '2024-01-14 08:15',
        location: 'Customs - New York',
        estimatedDelivery: '2024-01-20',
        noMovementDays: 6
      }
    ],
    alerts: [
      {
        id: 'ALT001',
        type: 'no-movement',
        tracking: 'TN123456790',
        order: '#12346',
        message: 'No movement for 6 days - Customs delay',
        severity: 'high',
        created: '2024-01-15 09:00'
      },
      {
        id: 'ALT002',
        type: 'delivery-failed',
        tracking: 'TN123456788',
        order: '#12344',
        message: 'Delivery attempt failed - Customer not available',
        severity: 'medium',
        created: '2024-01-15 14:30'
      }
    ],
    delivered: [
      {
        id: 'TN123456785',
        order: '#12340',
        customer: 'Mike Johnson',
        carrier: 'DHL',
        deliveredDate: '2024-01-14',
        deliveredTo: 'Front Door',
        signedBy: 'M. Johnson'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'in-transit': 'bg-blue-100 text-blue-800',
      'customs-delay': 'bg-yellow-100 text-yellow-800',
      'delivered': 'bg-green-100 text-green-800',
      'delivery-failed': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logistics & Shipping</h1>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Manifest
          </Button>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Create Shipment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking">Active Tracking</TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            Alerts <Badge variant="destructive">{trackingData.alerts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>Real-time tracking with 17track integration</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackingData.active.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.id}</TableCell>
                      <TableCell>{shipment.order}</TableCell>
                      <TableCell>{shipment.customer}</TableCell>
                      <TableCell>{shipment.carrier}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {shipment.status.replace('-', ' ')}
                        </Badge>
                        {shipment.noMovementDays > 5 && (
                          <Badge variant="destructive" className="ml-2">
                            {shipment.noMovementDays}d no movement
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shipment.location}
                        </div>
                      </TableCell>
                      <TableCell>{shipment.estimatedDelivery}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Truck className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Shipment</DialogTitle>
                                <DialogDescription>
                                  Update tracking information and delivery estimates
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="carrier">Carrier</Label>
                                    <Input id="carrier" defaultValue={shipment.carrier} />
                                  </div>
                                  <div>
                                    <Label htmlFor="estDelivery">Est. Delivery</Label>
                                    <Input id="estDelivery" type="date" defaultValue={shipment.estimatedDelivery} />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea id="notes" placeholder="Add tracking notes..." />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button>Update</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Alerts</CardTitle>
              <CardDescription>Automated alerts from tracking system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingData.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <AlertTriangle className={`w-5 h-5 mt-1 ${
                      alert.severity === 'high' ? 'text-red-500' : 
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.tracking}</span>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Order: {alert.order}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.created}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Order</Button>
                      <Button size="sm">Resolve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Shipments</CardTitle>
              <CardDescription>Successfully delivered packages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Delivered Date</TableHead>
                    <TableHead>Delivered To</TableHead>
                    <TableHead>Signed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackingData.delivered.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell>{delivery.order}</TableCell>
                      <TableCell>{delivery.customer}</TableCell>
                      <TableCell>{delivery.carrier}</TableCell>
                      <TableCell>{delivery.deliveredDate}</TableCell>
                      <TableCell>{delivery.deliveredTo}</TableCell>
                      <TableCell>{delivery.signedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>On-time Delivery Rate</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Transit Time</span>
                    <span className="font-bold">4.2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customs Delays</span>
                    <span className="font-bold text-yellow-600">3.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carrier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>FedEx</span>
                    <span className="font-bold">96.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPS</span>
                    <span className="font-bold">94.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DHL</span>
                    <span className="font-bold">92.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsShipping;
