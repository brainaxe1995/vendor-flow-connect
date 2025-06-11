
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
import { Upload, Plus, DollarSign, Clock, FileText, TrendingUp, Package } from 'lucide-react';

const SourcingPricing = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mock sourcing data
  const sourcingData = {
    productRequests: [
      {
        id: 'PR001',
        title: 'Eco-Friendly Phone Cases',
        category: 'Electronics Accessories',
        requestedBy: 'Product Team',
        status: 'pending',
        priority: 'high',
        targetPrice: '$15.00',
        targetQuantity: 1000,
        deadline: '2024-02-15',
        description: 'Biodegradable phone cases for iPhone and Samsung models'
      },
      {
        id: 'PR002',
        title: 'Wireless Charging Pads',
        category: 'Electronics',
        requestedBy: 'Sales Team',
        status: 'sourcing',
        priority: 'medium',
        targetPrice: '$25.00',
        targetQuantity: 500,
        deadline: '2024-02-28',
        description: 'Fast wireless charging pads with LED indicators'
      }
    ],
    priceUpdates: [
      {
        id: 'PU001',
        product: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        currentPrice: 199.99,
        proposedPrice: 189.99,
        reason: 'Raw material cost reduction',
        effectiveDate: '2024-02-01',
        status: 'pending-approval',
        savings: 10.00
      },
      {
        id: 'PU002',
        product: 'Smart Fitness Tracker',
        sku: 'SFT-002',
        currentPrice: 149.99,
        proposedPrice: 159.99,
        reason: 'Component cost increase',
        effectiveDate: '2024-02-15',
        status: 'approved',
        savings: -10.00
      }
    ],
    certifications: [
      {
        id: 'CERT001',
        supplier: 'Tech Manufacturing Co.',
        type: 'ISO 9001:2015',
        validUntil: '2025-06-30',
        status: 'valid',
        document: 'iso-9001-cert.pdf'
      },
      {
        id: 'CERT002',
        supplier: 'Electronics Factory Ltd.',
        type: 'CE Certification',
        validUntil: '2024-12-31',
        status: 'expiring-soon',
        document: 'ce-cert.pdf'
      }
    ],
    leadTimes: [
      {
        product: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        standardLeadTime: '14-21 days',
        currentLeadTime: '18 days',
        supplier: 'Audio Tech Ltd.',
        lastUpdated: '2024-01-15'
      },
      {
        product: 'Smart Fitness Tracker',
        sku: 'SFT-002',
        standardLeadTime: '10-15 days',
        currentLeadTime: '12 days',
        supplier: 'Wearable Tech Co.',
        lastUpdated: '2024-01-14'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sourcing': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending-approval': 'bg-orange-100 text-orange-800',
      'valid': 'bg-green-100 text-green-800',
      'expiring-soon': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sourcing & Pricing</h1>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Price Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Price Update</DialogTitle>
                <DialogDescription>
                  Propose a price change for existing products
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="productSelect">Select Product</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Premium Wireless Headphones (PWH-001)</option>
                    <option>Smart Fitness Tracker (SFT-002)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentPrice">Current Price</Label>
                    <Input id="currentPrice" value="$199.99" disabled />
                  </div>
                  <div>
                    <Label htmlFor="proposedPrice">Proposed Price</Label>
                    <Input id="proposedPrice" type="number" step="0.01" placeholder="189.99" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input id="effectiveDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Change</Label>
                  <Textarea id="reason" placeholder="Explain the reason for this price change..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Product Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Product Request</DialogTitle>
                <DialogDescription>
                  Submit a request for sourcing a new product
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="productTitle">Product Title</Label>
                  <Input id="productTitle" placeholder="Enter product title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Electronics</option>
                      <option>Electronics Accessories</option>
                      <option>Home & Garden</option>
                      <option>Sports & Outdoors</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="targetPrice">Target Price</Label>
                    <Input id="targetPrice" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="targetQuantity">Target Quantity</Label>
                    <Input id="targetQuantity" type="number" placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea id="description" placeholder="Detailed product description and requirements..." />
                </div>
                <div>
                  <Label>Attach Specifications</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload product specifications, images, or reference documents
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Submit Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Product Requests</TabsTrigger>
          <TabsTrigger value="pricing">Price Updates</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="leadtimes">Lead Times</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Product Sourcing Requests</CardTitle>
              <CardDescription>Track new product sourcing and procurement requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Target Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcingData.productRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.targetPrice}</TableCell>
                      <TableCell>{request.targetQuantity}</TableCell>
                      <TableCell>{request.deadline}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Price Update Requests</CardTitle>
              <CardDescription>Manage pricing changes and cost adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Proposed Price</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcingData.priceUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell className="font-medium">{update.id}</TableCell>
                      <TableCell>{update.product}</TableCell>
                      <TableCell className="font-mono text-sm">{update.sku}</TableCell>
                      <TableCell>${update.currentPrice}</TableCell>
                      <TableCell>${update.proposedPrice}</TableCell>
                      <TableCell>
                        <span className={update.savings > 0 ? 'text-green-600' : 'text-red-600'}>
                          {update.savings > 0 ? '+' : ''}${update.savings.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{update.effectiveDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(update.status)}>
                          {update.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Factory Certifications</CardTitle>
              <CardDescription>Manage supplier certifications and compliance documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Certification Type</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcingData.certifications.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.supplier}</TableCell>
                      <TableCell>{cert.type}</TableCell>
                      <TableCell>{cert.validUntil}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          {cert.document}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leadtimes">
          <Card>
            <CardHeader>
              <CardTitle>Product Lead Times</CardTitle>
              <CardDescription>Track manufacturing and delivery lead times by product</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Standard Lead Time</TableHead>
                    <TableHead>Current Lead Time</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcingData.leadTimes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>{item.standardLeadTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {item.currentLeadTime}
                        </div>
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SourcingPricing;
