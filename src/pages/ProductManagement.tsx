
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
import { Package, Upload, Edit, Eye, AlertTriangle, Plus, Search, Filter } from 'lucide-react';

const ProductManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Mock product data with WooCommerce structure
  const products = {
    active: [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        price: 199.99,
        stock: 45,
        moq: 10,
        status: 'active',
        images: ['/placeholder.svg'],
        variants: [
          { id: '1a', name: 'Black', sku: 'PWH-001-BLK', stock: 25, price: 199.99 },
          { id: '1b', name: 'White', sku: 'PWH-001-WHT', stock: 20, price: 199.99 }
        ],
        packaging: {
          weight: '0.8kg',
          dimensions: '20x15x8cm',
          material: 'Cardboard box'
        },
        certifications: ['CE', 'FCC', 'RoHS']
      },
      {
        id: '2',
        name: 'Smart Fitness Tracker',
        sku: 'SFT-002',
        price: 149.99,
        stock: 23,
        moq: 20,
        status: 'active',
        images: ['/placeholder.svg'],
        variants: [
          { id: '2a', name: 'Black', sku: 'SFT-002-BLK', stock: 15, price: 149.99 },
          { id: '2b', name: 'Blue', sku: 'SFT-002-BLU', stock: 8, price: 149.99 }
        ],
        packaging: {
          weight: '0.3kg',
          dimensions: '15x10x5cm',
          material: 'Eco-friendly box'
        },
        certifications: ['CE', 'FDA']
      }
    ],
    outOfStock: [
      {
        id: '3',
        name: 'Bluetooth Speaker Pro',
        sku: 'BSP-003',
        price: 89.99,
        stock: 0,
        moq: 25,
        status: 'out-of-stock',
        reorderDate: '2024-01-20'
      }
    ],
    discontinued: [
      {
        id: '4',
        name: 'Old Model Earbuds',
        sku: 'OME-004',
        price: 39.99,
        stock: 5,
        status: 'discontinued',
        discontinuedDate: '2024-01-01'
      }
    ]
  };

  const getStockStatus = (stock: number, moq: number = 0) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= moq) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const ProductTable = ({ products, showReorderDate = false, showDiscontinuedDate = false }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>MOQ</TableHead>
          {showReorderDate && <TableHead>Reorder Date</TableHead>}
          {showDiscontinuedDate && <TableHead>Discontinued</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.moq);
          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-10 h-10 rounded" />
                  <span className="font-medium">{product.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{product.sku}</TableCell>
              <TableCell className="text-sm text-muted-foreground">${product.price}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{product.stock}</span>
                  <Badge className={stockStatus.color} variant="outline">
                    {stockStatus.label}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{product.moq || '-'}</TableCell>
              {showReorderDate && <TableCell>{product.reorderDate}</TableCell>}
              {showDiscontinuedDate && <TableCell>{product.discontinuedDate}</TableCell>}
              <TableCell>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Product: {product.name}</DialogTitle>
                        <DialogDescription>
                          Update product information, variants, and settings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="productName">Product Name</Label>
                            <Input id="productName" defaultValue={product.name} />
                          </div>
                          <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" defaultValue={product.sku} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" type="number" step="0.01" defaultValue={product.price} />
                          </div>
                          <div>
                            <Label htmlFor="stock">Stock Level</Label>
                            <Input id="stock" type="number" defaultValue={product.stock} />
                          </div>
                          <div>
                            <Label htmlFor="moq">MOQ</Label>
                            <Input id="moq" type="number" defaultValue={product.moq} />
                          </div>
                        </div>
                        
                        {product.variants && (
                          <div>
                            <Label>Product Variants</Label>
                            <div className="space-y-2 mt-2">
                              {product.variants.map((variant, index) => (
                                <div key={variant.id} className="grid grid-cols-4 gap-2 p-3 border rounded">
                                  <Input defaultValue={variant.name} placeholder="Variant name" />
                                  <Input defaultValue={variant.sku} placeholder="SKU" />
                                  <Input type="number" defaultValue={variant.stock} placeholder="Stock" />
                                  <Input type="number" step="0.01" defaultValue={variant.price} placeholder="Price" />
                                </div>
                              ))}
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Variant
                              </Button>
                            </div>
                          </div>
                        )}

                        {product.packaging && (
                          <div>
                            <Label>Packaging Details</Label>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                              <div>
                                <Label htmlFor="weight">Weight</Label>
                                <Input id="weight" defaultValue={product.packaging.weight} />
                              </div>
                              <div>
                                <Label htmlFor="dimensions">Dimensions</Label>
                                <Input id="dimensions" defaultValue={product.packaging.dimensions} />
                              </div>
                              <div>
                                <Label htmlFor="material">Material</Label>
                                <Input id="material" defaultValue={product.packaging.material} />
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <Label>Upload Documents</Label>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center mt-2">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Drop safety sheets, data sheets, or certifications here
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
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product or submit a product proposal
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newProductName">Product Name</Label>
                    <Input id="newProductName" placeholder="Enter product name" />
                  </div>
                  <div>
                    <Label htmlFor="newSku">SKU</Label>
                    <Input id="newSku" placeholder="Enter SKU" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="newPrice">Price ($)</Label>
                    <Input id="newPrice" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="newStock">Initial Stock</Label>
                    <Input id="newStock" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="newMoq">MOQ</Label>
                    <Input id="newMoq" type="number" placeholder="1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Product description..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Create Product</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active <Badge variant="secondary">{products.active.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="outOfStock" className="flex items-center gap-2">
            Out of Stock <Badge variant="destructive">{products.outOfStock.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="discontinued" className="flex items-center gap-2">
            Discontinued <Badge variant="secondary">{products.discontinued.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Products</CardTitle>
              <CardDescription>Products currently available for sale</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable products={products.active} />
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
              <ProductTable products={products.outOfStock} showReorderDate={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discontinued">
          <Card>
            <CardHeader>
              <CardTitle>Discontinued Products</CardTitle>
              <CardDescription>Products no longer in production</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable products={products.discontinued} showDiscontinuedDate={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManagement;
