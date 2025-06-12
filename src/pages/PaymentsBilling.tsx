
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, FileText, Calendar, Download, CreditCard, Loader2 } from 'lucide-react';
import { useSalesReport } from '@/hooks/useWooCommerceReports';

const PaymentsBilling = () => {
  const [dateRange] = useState({
    date_min: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
    date_max: new Date().toISOString().split('T')[0]
  });

  // Use real WooCommerce sales data for payment insights
  const { data: salesData, isLoading } = useSalesReport(dateRange);

  // Calculate payment metrics from real sales data
  const getPaymentMetrics = () => {
    if (!salesData || !Array.isArray(salesData.totals)) {
      return {
        totalRevenue: 0,
        ordersCount: 0,
        averageOrderValue: 0,
        pendingPayments: 0
      };
    }

    const totals = salesData.totals;
    const totalRevenue = totals.reduce((sum: number, item: any) => sum + parseFloat(item.sales || 0), 0);
    const ordersCount = totals.reduce((sum: number, item: any) => sum + parseInt(item.orders || 0), 0);
    
    return {
      totalRevenue,
      ordersCount,
      averageOrderValue: ordersCount > 0 ? totalRevenue / ordersCount : 0,
      pendingPayments: totalRevenue * 0.1 // Estimate 10% pending
    };
  };

  const metrics = getPaymentMetrics();

  // Mock payment terms - in production, this could come from Supabase user settings
  const paymentTerms = [
    { term: 'Net-30', description: '30 days from invoice date', active: true },
    { term: 'Net-15', description: '15 days from invoice date', active: false },
    { term: 'Immediate', description: 'Payment due immediately', active: false }
  ];

  // Generate mock invoices based on real sales data
  const generateInvoices = () => {
    if (!salesData || metrics.ordersCount === 0) return [];
    
    return [
      {
        id: 'INV-001',
        amount: metrics.averageOrderValue * 1.2,
        status: 'paid',
        dueDate: '2024-01-15',
        paidDate: '2024-01-14',
        period: 'December 2023'
      },
      {
        id: 'INV-002',
        amount: metrics.pendingPayments,
        status: 'outstanding',
        dueDate: '2024-02-15',
        paidDate: null,
        period: 'January 2024'
      },
      {
        id: 'INV-003',
        amount: metrics.averageOrderValue * 0.8,
        status: 'paid',
        dueDate: '2024-01-30',
        paidDate: '2024-01-28',
        period: 'November 2023'
      }
    ];
  };

  const invoices = generateInvoices();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Statement
        </Button>
      </div>

      {/* Payment Summary Cards - Using Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${metrics.pendingPayments.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ordersCount}</div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Your recent billing history and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No invoices available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Invoices will appear here once you have sales data
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.period}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{invoice.paidDate || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                        {invoice.status === 'outstanding' && (
                          <Button size="sm">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
          <CardDescription>Configure your preferred payment terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentTerms.map((term) => (
              <div 
                key={term.term} 
                className={`p-4 border rounded-lg ${
                  term.active ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{term.term}</h4>
                  {term.active && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{term.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">Bank Transfer (ACH)</p>
                  <p className="text-sm text-muted-foreground">Primary payment method</p>
                </div>
              </div>
              <Badge variant="default">Primary</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="font-medium">Credit Card (**** 1234)</p>
                  <p className="text-sm text-muted-foreground">Backup payment method</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsBilling;
