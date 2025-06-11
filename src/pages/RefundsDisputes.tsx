
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, AlertTriangle, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { useOrders, useCreateRefund } from '../hooks/useWooCommerce';
import { toast } from 'sonner';

const RefundsDisputes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: refundedData, isLoading: refundedLoading } = useOrders({ 
    status: 'refunded',
    search: searchTerm 
  });
  const { data: cancelledData, isLoading: cancelledLoading } = useOrders({ 
    status: 'cancelled',
    search: searchTerm 
  });
  const { data: completedData, isLoading: completedLoading } = useOrders({ 
    status: 'completed',
    search: searchTerm 
  });

  // Extract orders from data wrapper
  const refundedOrders = refundedData?.orders || [];
  const cancelledOrders = cancelledData?.orders || [];
  const completedOrders = completedData?.orders || [];

  const createRefundMutation = useCreateRefund();

  const handleCreateRefund = async () => {
    if (!selectedOrder || !refundAmount || !refundReason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createRefundMutation.mutateAsync({
        orderId: selectedOrder.id,
        data: {
          amount: refundAmount,
          reason: refundReason,
          refund_payment: true
        }
      });

      toast.success('Refund processed successfully');
      setSelectedOrder(null);
      setRefundAmount('');
      setRefundReason('');
    } catch (error) {
      toast.error('Failed to process refund');
      console.error('Refund error:', error);
    }
  };

  const RefundTable = ({ orders, isLoading, showRefundAction = false }: { 
    orders: any[], 
    isLoading: boolean,
    showRefundAction?: boolean 
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Order Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            {showRefundAction && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                  <p className="text-sm text-muted-foreground">{order.billing.email}</p>
                </div>
              </TableCell>
              <TableCell>${order.total}</TableCell>
              <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge 
                  className={
                    order.status === 'refunded' ? 'bg-red-100 text-red-800' :
                    order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              {showRefundAction && (
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setRefundAmount(order.total);
                        }}
                      >
                        Process Refund
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Process Refund - Order #{order.id}</DialogTitle>
                        <DialogDescription>
                          Create a refund for this order
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="refundAmount">Refund Amount ($)</Label>
                            <Input 
                              id="refundAmount"
                              type="number"
                              step="0.01"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Order Total</Label>
                            <div className="p-2 bg-muted rounded text-sm">
                              ${order.total}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="refundReason">Refund Reason</Label>
                          <Textarea 
                            id="refundReason"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Explain the reason for refund..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateRefund}
                            disabled={createRefundMutation.isPending}
                          >
                            {createRefundMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Process Refund'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Refunds & Disputes</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refundedOrders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Processed refunds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Awaiting resolution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Refund Management */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Eligible for Refund</CardTitle>
            <CardDescription>Completed orders that can be refunded</CardDescription>
          </CardHeader>
          <CardContent>
            <RefundTable 
              orders={completedOrders} 
              isLoading={completedLoading} 
              showRefundAction={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processed Refunds</CardTitle>
            <CardDescription>Orders that have been refunded</CardDescription>
          </CardHeader>
          <CardContent>
            <RefundTable orders={refundedOrders} isLoading={refundedLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancelled Orders</CardTitle>
            <CardDescription>Orders that were cancelled</CardDescription>
          </CardHeader>
          <CardContent>
            <RefundTable orders={cancelledOrders} isLoading={cancelledLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundsDisputes;
