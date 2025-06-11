
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
import { CreditCard, DollarSign, Download, Eye, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Filter, Search } from 'lucide-react';

const PaymentsBilling = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Mock data for payments and billing
  const invoices = {
    pending: [
      {
        id: 'INV-001',
        orderNumber: '12345',
        customer: 'John Doe',
        amount: 299.99,
        tax: 24.00,
        total: 323.99,
        dueDate: '2024-01-20',
        status: 'pending',
        paymentMethod: 'Credit Card'
      },
      {
        id: 'INV-002',
        orderNumber: '12346',
        customer: 'Jane Smith',
        amount: 149.99,
        tax: 12.00,
        total: 161.99,
        dueDate: '2024-01-22',
        status: 'pending',
        paymentMethod: 'PayPal'
      }
    ],
    paid: [
      {
        id: 'INV-003',
        orderNumber: '12340',
        customer: 'Mike Johnson',
        amount: 199.99,
        tax: 16.00,
        total: 215.99,
        paidDate: '2024-01-15',
        status: 'paid',
        paymentMethod: 'Bank Transfer'
      }
    ],
    overdue: [
      {
        id: 'INV-004',
        orderNumber: '12330',
        customer: 'Sarah Wilson',
        amount: 399.99,
        tax: 32.00,
        total: 431.99,
        dueDate: '2024-01-10',
        status: 'overdue',
        paymentMethod: 'Credit Card',
        daysPastDue: 5
      }
    ],
    disputed: [
      {
        id: 'INV-005',
        orderNumber: '12320',
        customer: 'David Brown',
        amount: 249.99,
        tax: 20.00,
        total: 269.99,
        disputeDate: '2024-01-12',
        status: 'disputed',
        paymentMethod: 'Credit Card',
        disputeReason: 'Billing discrepancy'
      }
    ]
  };

  const paymentStats = {
    totalRevenue: 15420.50,
    pendingPayments: 485.98,
    overdueAmount: 431.99,
    averagePaymentTime: 3.2
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const InvoiceTable = ({ invoices, showPaidDate = false, showDaysOverdue = false, showDisputeInfo = false }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Tax</TableHead>
          <TableHead>Total</TableHead>
          {showPaidDate && <TableHead>Paid Date</TableHead>}
          {showDaysOverdue && <TableHead>Days Overdue</TableHead>}
          {showDisputeInfo && <TableHead>Dispute Reason</TableHead>}
          <TableHead>Payment Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>#{invoice.orderNumber}</TableCell>
            <TableCell>{invoice.customer}</TableCell>
            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
            <TableCell>${invoice.tax.toFixed(2)}</TableCell>
            <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
            {showPaidDate && (
              <TableCell>{invoice.paidDate || '-'}</TableCell>
            )}
            {showDaysOverdue && (
              <TableCell>
                {invoice.daysPastDue ? (
                  <Badge variant="destructive">{invoice.daysPastDue} days</Badge>
                ) : '-'}
              </TableCell>
            )}
            {showDisputeInfo && (
              <TableCell>{invoice.disputeReason || '-'}</TableCell>
            )}
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                {invoice.status === 'pending' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Send Reminder</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Payment Reminder</DialogTitle>
                        <DialogDescription>
                          Send a payment reminder to the customer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="reminderType">Reminder Type</Label>
                          <select id="reminderType" className="w-full p-2 border rounded-md">
                            <option>Friendly Reminder</option>
                            <option>First Notice</option>
                            <option>Final Notice</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="customMessage">Custom Message</Label>
                          <Textarea id="customMessage" placeholder="Add a personal message..." />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Send Reminder</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
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
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoices..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.pendingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{invoices.pending.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${paymentStats.overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{invoices.overdue.length} overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.averagePaymentTime} days</div>
            <p className="text-xs text-muted-foreground">Average collection</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending <Badge variant="secondary">{invoices.pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center gap-2">
            Paid <Badge variant="secondary">{invoices.paid.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            Overdue <Badge variant="destructive">{invoices.overdue.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="disputed" className="flex items-center gap-2">
            Disputed <Badge variant="secondary">{invoices.disputed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
              <CardDescription>Invoices awaiting payment</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={invoices.pending} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>Successfully completed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={invoices.paid} showPaidDate={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>Invoices past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={invoices.overdue} showDaysOverdue={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputed">
          <Card>
            <CardHeader>
              <CardTitle>Disputed Invoices</CardTitle>
              <CardDescription>Invoices under dispute</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={invoices.disputed} showDisputeInfo={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsBilling;
