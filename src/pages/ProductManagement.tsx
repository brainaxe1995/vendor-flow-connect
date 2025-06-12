
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
import { Search, Filter, Edit, Eye, Loader2, RefreshCw } from 'lucide-react';
import { useProducts, useUpdateProduct } from '../hooks/useWooCommerce';
import { toast } from 'sonner';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productSku, setProductSku] = useState('');

  const { data: activeProductsResponse, isLoading: activeLoading, refetch: refetchActive } = useProducts({ 
    status: 'publish', 
    search: searchTerm 
  });
  const { data: outOfStockResponse, isLoading: outOfStockLoading } = useProducts({ 
    stock_status: 'outofstock',
    search: searchTerm 
  });
  const { data: draftProductsResponse, isLoading: draftLoading } = useProducts({ 
    status: 'draft',
    search: searchTerm 
  });

  // Extract products arrays from responses
  const activeProducts = activeProductsResponse?.data || [];
  const outOfStockProducts = outOfStockResponse?.data || [];
  const draftProducts = draftProductsResponse?.data || [];

  const updateProductMutation = useUpdateProduct();

  const getStockStatus = (product: any) => {
    if (product.stock_status === 'outofstock') {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    }
    if (product.stock_quantity > 0 && product.stock_quantity <= 5) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (product.stock_status === 'instock') {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.regular_price);
    setProductStock(product.stock_quantity?.toString() || '0');
    setProductSku(product.sku || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const updateData: any = {};
      
      if (productName !== editingProduct.name) updateData.name = productName;
      if (productPrice !== editingProduct.regular_price) updateData.regular_price = productPrice;
      if (productStock !== editingProduct.stock_quantity?.toString()) updateData.stock_quantity = parseInt(productStock);
      if (productSku !== editingProduct.sku) updateData.sku = productSku;

      await updateProductMutation.mutateAsync({
        productId: editingProduct.id,
        data: updateData
      });

      toast.success('Product updated successfully');
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      refetchActive();
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Update product error:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductStock('');
    setProductSku('');
  };

  const handleRefreshClick = () => {
    refetchActive();
  };

  const ProductTable = ({ products, isLoading }: { products: any[], isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No products found
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      <img 
                        src={product.images[0].src} 
                        alt={product.name} 
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{product.sku || '-'}</TableCell>
                <TableCell>${product.price || product.regular_price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{product.stock_quantity || 0}</span>
                    <Badge className={stockStatus.color} variant="outline">
                      {stockStatus.label}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === 'publish' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefreshClick}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active <Badge variant="secondary">{activeProducts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="outOfStock" className="flex items-center gap-2">
            Out of Stock <Badge variant="destructive">{outOfStockProducts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-2">
            Draft <Badge variant="secondary">{draftProducts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Products</CardTitle>
              <CardDescription>Published products available for sale</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable products={activeProducts} isLoading={activeLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outOfStock">
          <Card>
            <CardHeader>
              <CardTitle>Out of Stock Products</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable products={outOfStockProducts} isLoading={outOfStockLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Products</CardTitle>
              <CardDescription>Unpublished products</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable products={draftProducts} isLoading={draftLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product: {editingProduct?.name}</DialogTitle>
            <DialogDescription>
              Update product information and inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input 
                  id="productName" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input 
                  id="sku" 
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Level</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProduct}
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
