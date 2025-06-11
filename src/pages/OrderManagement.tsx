
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
import { Upload, Eye, Edit, MessageSquare, Package, Calendar } from 'lucide-react';

const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock order data
  const orders = {
    new: [
      { id: '12345', customer: 'John Doe', products: 3, total: '$299.99', date: '2024-01-15', status: 'new' },
      { id: '12346', customer: 'Jane Smith', products: 1, total: '$99.99', date: '2024-01-15', status: 'new' }
    ],
    pending: [
      { id: '12340', customer: 'Mike Johnson', products: 2, total: '$199.99', date: '2024-01-14', status: 'pending' },
      { id: '12341', customer: 'Sarah Wilson', products: 4, total: '$449.99', date: '2024-01-14', status: 'pending' }
    ],
    processing: [
      { id: '12335', customer: 'David Brown', products: 1, total: '$79.99', date: '2024-01-13', status: 'processing' }
    ],
    inTransit: [
      { id: '12330', customer: 'Emma Davis', products: 2, total: '$159.99', date: '2024-01-12', status: 'in-transit', tracking: 'TN123456789' },
      { id: '12331', customer: 'Tom Wilson', products: 3, total: '$299.99', date: '2024-01-12', status: 'in-transit', tracking: 'TN123456790' }
    ],
    delivered: [
      { id: '12320', customer: 'Lisa Garcia', products: 1, total: '$129.99', date: '2024-01-10', status: 'delivered', tracking: 'TN123456785' },
      { id: '12321', customer: 'Chris Lee', products: 2, total: '$249.99', date: '2024-01-10', status: 'delivered', tracking: 'TN123456786' }
    ],
    returned: [
      { id: '12310', customer: 'Anna Taylor', products: 1, total: '$89.99', date: '2024-01-08', status: 'returned' }
    ],
    refunded: [
      { id: '12300', customer: 'Mark Anderson', products: 1, total: '$149.99', date: '2024-01-07', status: 'refunded' }
    ],
    cancelled: [
      { id: '12290', customer: 'Jessica White', products: 2, total: '$199.99', date: '2024-01-06', status: 'cancelled' }
    ]
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-orange-100 text-orange-800',
      'in-transit': 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      returned: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const OrderTable = ({ orders, showTracking = false }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Date</TableHead>
          {showTracking && <TableHead>Tracking</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.products}</TableCell>
            <TableCell>{order.total}</TableCell>
            <TableCell>{order.date}</TableCell>
            {showTracking && (
              <TableCell>
                {order.tracking ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded">{order.tracking}</code>
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
                    <Button variant="outline" size="sm">
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
                          <Input id="tracking" placeholder="Enter tracking number" />
                        </div>
                        <div>
                          <Label htmlFor="status">Order Status</Label>
                          <select className="w-full p-2 border rounded-md">
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>In Transit</option>
                            <option>Delivered</option>
                            <option>Delayed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea id="comments" placeholder="Add comments about this order..." />
                      </div>
                      <div>
                        <Label>Upload Files</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drop shipping labels, packaging slips, or other files here
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Browse Files
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <div className="flex gap-3">
          <Input placeholder="Search orders..." className="w-64" />
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Filter by Date
          </Button>
        </div>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="new" className="flex items-center gap-2">
            New <Badge variant="secondary" className="ml-1">{orders.new.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending <Badge variant="secondary" className="ml-1">{orders.pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            Processing <Badge variant="secondary" className="ml-1">{orders.processing.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inTransit" className="flex items-center gap-2">
            In Transit <Badge variant="secondary" className="ml-1">{orders.inTransit.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            Delivered <Badge variant="secondary" className="ml-1">{orders.delivered.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="returned" className="flex items-center gap-2">
            Returned <Badge variant="secondary" className="ml-1">{orders.returned.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="refunded" className="flex items-center gap-2">
            Refunded <Badge variant="secondary" className="ml-1">{orders.refunded.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            Cancelled <Badge variant="secondary" className="ml-1">{orders.cancelled.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Orders</CardTitle>
              <CardDescription>Orders that need to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={orders.new} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders awaiting supplier action</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={orders.pending} />
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
              <OrderTable orders={orders.processing} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inTransit">
          <Card>
            <CardHeader>
              <CardTitle>In Transit Orders</CardTitle>
              <CardDescription>Orders that have been shipped</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={orders.inTransit} showTracking={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
              <CardDescription>Successfully completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={orders.delivered} showTracking={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returned">
          <Card>
            <CardHeader>
              <CardTitle>Returned Orders</CardTitle>
              <CardDescription>Orders that have been returned</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={orders.returned} />
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
              <OrderTable orders={orders.refunded} />
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
              <OrderTable orders={orders.cancelled} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;
