
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSupabaseProposals } from '@/hooks/useSupabaseProposals';
import { useSupabasePriceRequests } from '@/hooks/useSupabasePriceRequests';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const SourcingPricing = () => {
  const { user } = useSupabaseAuth();
  const { proposals, loading: proposalsLoading, createProposal } = useSupabaseProposals();
  const { priceRequests, loading: priceRequestsLoading, createPriceRequest } = useSupabasePriceRequests();
  
  const [productName, setProductName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [moq, setMoq] = useState('');
  const [description, setDescription] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Price request form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [requestedPrice, setRequestedPrice] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmittingPriceRequest, setIsSubmittingPriceRequest] = useState(false);

  const handleSubmitProposal = async () => {
    if (!user) {
      toast.error('Please log in to submit proposals');
      return;
    }

    if (!productName || !targetPrice || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProposal({
        product_name: productName,
        proposed_price: parseFloat(targetPrice),
        min_quantity: moq ? parseInt(moq) : 1,
        description,
        lead_time_days: leadTime ? parseInt(leadTime) : null
      });

      toast.success('Product proposal submitted successfully');
      
      // Reset form
      setProductName('');
      setTargetPrice('');
      setMoq('');
      setDescription('');
      setLeadTime('');
    } catch (error) {
      toast.error('Failed to submit proposal');
      console.error('Error submitting proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPriceRequest = async () => {
    if (!user) {
      toast.error('Please log in to submit price requests');
      return;
    }

    if (!selectedProduct || !currentPrice || !requestedPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmittingPriceRequest(true);
    try {
      await createPriceRequest({
        woocommerce_product_id: parseInt(selectedProduct),
        current_price: parseFloat(currentPrice),
        requested_price: parseFloat(requestedPrice),
        reason
      });

      toast.success('Price update request submitted successfully');
      
      // Reset form
      setSelectedProduct('');
      setCurrentPrice('');
      setRequestedPrice('');
      setReason('');
    } catch (error) {
      toast.error('Failed to submit price request');
      console.error('Error submitting price request:', error);
    } finally {
      setIsSubmittingPriceRequest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Sourcing & Pricing</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please log in to access sourcing and pricing features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Label htmlFor="leadTime">Lead Time (days)</Label>
              <Input 
                id="leadTime"
                type="number"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="30"
              />
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
            <Button 
              onClick={handleSubmitProposal} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <Label htmlFor="existingProduct">WooCommerce Product ID</Label>
              <Input
                id="existingProduct"
                type="number"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                placeholder="Enter product ID from WooCommerce"
              />
            </div>
            <div>
              <Label htmlFor="currentPrice">Current Price ($)</Label>
              <Input 
                id="currentPrice"
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="Current selling price"
              />
            </div>
            <div>
              <Label htmlFor="requestedPrice">Requested Price ($)</Label>
              <Input 
                id="requestedPrice"
                type="number"
                step="0.01"
                value={requestedPrice}
                onChange={(e) => setRequestedPrice(e.target.value)}
                placeholder="New price request"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Change</Label>
              <Textarea 
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the price change is needed..."
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSubmitPriceRequest}
              className="w-full"
              disabled={isSubmittingPriceRequest}
            >
              {isSubmittingPriceRequest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          {proposalsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading proposals...</span>
            </div>
          ) : proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{proposal.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Target: ${proposal.proposed_price} | MOQ: {proposal.min_quantity}
                      {proposal.lead_time_days && ` | Lead Time: ${proposal.lead_time_days} days`}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(proposal.status || 'pending')}>
                      {proposal.status?.replace('_', ' ') || 'pending'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {formatDate(proposal.created_at || '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No proposals submitted yet. Submit your first proposal above!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Price Requests */}
      {priceRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Update Requests</CardTitle>
            <CardDescription>
              Track the status of your price update requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {priceRequestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading price requests...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {priceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Product ID: {request.woocommerce_product_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: ${request.current_price} → Requested: ${request.requested_price}
                      </p>
                      {request.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(request.status || 'pending')}>
                        {request.status || 'pending'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDate(request.created_at || '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SourcingPricing;
