
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, FileText, Calendar, Download, CreditCard } from 'lucide-react';

const PaymentsBilling = () => {
  // Mock data for invoices and payments
  const invoices = [
    { id: 'INV-001', amount: 2450.00, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-14' },
    { id: 'INV-002', amount: 1850.00, status: 'outstanding', dueDate: '2024-02-15', paidDate: null },
    { id: 'INV-003', amount: 3200.00, status: 'paid', dueDate: '2024-01-30', paidDate: '2024-01-28' }
  ];

  const paymentTerms = [
    { term: 'Net-30', description: '30 days from invoice date', active: true },
    { term: 'Net-15', description: '15 days from invoice date', active: false },
    { term: 'Immediate', description: 'Payment due immediately', active: false }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Statement
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$1,850.00</div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$5,650.00</div>
            <p className="text-xs text-muted-foreground">From 3 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feb 15</div>
            <p className="text-xs text-muted-foreground">$1,850.00 due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Net-30</div>
            <p className="text-xs text-muted-foreground">Current terms</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
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
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
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
