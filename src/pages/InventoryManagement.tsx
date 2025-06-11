
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Edit, AlertTriangle, Package, Loader2 } from 'lucide-react';
import { useProducts, useUpdateProduct } from '../hooks/useWooCommerce';
import { toast } from 'sonner';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState('');

  const { data: productsResponse, isLoading, refetch } = useProducts({ search: searchTerm });
  const updateProductMutation = useUpdateProduct();

  // Extract products array from response
  const products = productsResponse?.data || [];

  const getStockStatus = (product: any) => {
    if (product.stock_status === 'outofstock' || product.stock_quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: '🔴' };
    }
    if (product.stock_quantity > 0 && product.stock_quantity <= 5) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
    }
    if (product.stock_quantity > 5 && product.stock_quantity <= 20) {
      return { label: 'Medium Stock', color: 'bg-blue-100 text-blue-800', icon: '🔵' };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: '🟢' };
  };

  const handleUpdateStock = async () => {
    if (!editingProduct || !newStock) return;

    try {
      await updateProductMutation.mutateAsync({
        productId: editingProduct.id,
        data: {
          stock_quantity: parseInt(newStock),
          manage_stock: true,
          stock_status: parseInt(newStock) > 0 ? 'instock' : 'outofstock'
        }
      });

      toast.success('Stock updated successfully');
      setEditingProduct(null);
      setNewStock('');
      refetch();
    } catch (error) {
      toast.error('Failed to update stock');
      console.error('Update stock error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading inventory...</span>
        </div>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0 || p.stock_status === 'outofstock');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>{lowStockProducts.length} products need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-sm">{product.name}</span>
                    <Badge variant="secondary">{product.stock_quantity} left</Badge>
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{lowStockProducts.length - 3} more</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No low stock items</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Package className="w-5 h-5" />
              Out of Stock
            </CardTitle>
            <CardDescription>{outOfStockProducts.length} products unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            {outOfStockProducts.length > 0 ? (
              <div className="space-y-2">
                {outOfStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-sm">{product.name}</span>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                ))}
                {outOfStockProducts.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{outOfStockProducts.length - 3} more</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All products in stock</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage stock levels for all products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
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
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.stock_quantity || 0}</span>
                        <span className="text-lg">{stockStatus.icon}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>${product.price || product.regular_price}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setNewStock(product.stock_quantity?.toString() || '0');
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Stock: {product.name}</DialogTitle>
                            <DialogDescription>
                              Adjust inventory levels for this product
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
                              <Label htmlFor="stock">New Stock Quantity</Label>
                              <Input 
                                id="stock" 
                                type="number" 
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                placeholder="Enter stock quantity"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleUpdateStock}
                                disabled={updateProductMutation.isPending}
                              >
                                {updateProductMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  'Update Stock'
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
