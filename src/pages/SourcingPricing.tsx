
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const SourcingPricing = () => {
  const [productName, setProductName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [moq, setMoq] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmitProposal = () => {
    if (!productName || !targetPrice || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real implementation, this would save to your backend
    toast.success('Product proposal submitted successfully');
    setProductName('');
    setTargetPrice('');
    setMoq('');
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sourcing & Pricing</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Product Proposal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Product Proposal
            </CardTitle>
            <CardDescription>
              Submit a proposal for a new product to source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input 
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetPrice">Target Price ($) *</Label>
                <Input 
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="moq">Minimum Order Quantity</Label>
                <Input 
                  id="moq"
                  type="number"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Product Description *</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product specifications, requirements, certifications needed..."
                rows={4}
              />
            </div>
            <Button onClick={handleSubmitProposal} className="w-full">
              Submit Proposal
            </Button>
          </CardContent>
        </Card>

        {/* Price Update Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Price Update Request
            </CardTitle>
            <CardDescription>
              Request pricing updates for existing products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="existingProduct">Select Product</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Choose a product...</option>
                <option value="product1">Wireless Headphones</option>
                <option value="product2">Fitness Tracker</option>
                <option value="product3">Bluetooth Speaker</option>
              </select>
            </div>
            <div>
              <Label htmlFor="currentPrice">Current Price ($)</Label>
              <Input 
                id="currentPrice"
                type="number"
                step="0.01"
                placeholder="Current selling price"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="requestedPrice">Requested Price ($)</Label>
              <Input 
                id="requestedPrice"
                type="number"
                step="0.01"
                placeholder="New price request"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Change</Label>
              <Textarea 
                id="reason"
                placeholder="Explain why the price change is needed..."
                rows={3}
              />
            </div>
            <Button className="w-full">
              Submit Price Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Proposals
          </CardTitle>
          <CardDescription>
            Track the status of your submitted proposals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Smart Water Bottle</h4>
                <p className="text-sm text-muted-foreground">Target: $25.00 | MOQ: 500</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Under Review
                </span>
                <p className="text-xs text-muted-foreground mt-1">Submitted 2 days ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Eco-friendly Phone Case</h4>
                <p className="text-sm text-muted-foreground">Target: $15.00 | MOQ: 1000</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Approved
                </span>
                <p className="text-xs text-muted-foreground mt-1">Approved 1 week ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Wireless Charging Pad</h4>
                <p className="text-sm text-muted-foreground">Target: $30.00 | MOQ: 200</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Needs Revision
                </span>
                <p className="text-xs text-muted-foreground mt-1">Feedback 3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SourcingPricing;
