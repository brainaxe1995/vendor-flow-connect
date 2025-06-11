
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Package, MapPin, RotateCcw, TrendingDown, TrendingUp, Warehouse } from 'lucide-react';

const InventoryManagement = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock inventory data with WooCommerce sync
  const inventoryData = {
    current: [
      {
        id: '1',
        product: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        currentStock: 45,
        reorderPoint: 20,
        safetyStock: 10,
        warehouseLocation: 'A1-B2-C3',
        lastRestocked: '2024-01-10',
        supplier: 'Audio Tech Ltd.',
        unitCost: 125.00,
        totalValue: 5625.00,
        status: 'adequate'
      },
      {
        id: '2',
        product: 'Smart Fitness Tracker',
        sku: 'SFT-002',
        currentStock: 8,
        reorderPoint: 15,
        safetyStock: 5,
        warehouseLocation: 'B2-C1-D2',
        lastRestocked: '2024-01-05',
        supplier: 'Wearable Tech Co.',
        unitCost: 89.99,
        totalValue: 719.92,
        status: 'low'
      },
      {
        id: '3',
        product: 'Bluetooth Speaker Pro',
        sku: 'BSP-003',
        currentStock: 0,
        reorderPoint: 25,
        safetyStock: 10,
        warehouseLocation: 'C1-D2-E1',
        lastRestocked: '2023-12-20',
        supplier: 'Sound Systems Inc.',
        unitCost: 65.00,
        totalValue: 0,
        status: 'out-of-stock'
      }
    ],
    stockLogs: [
      {
        id: 'LOG001',
        product: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        type: 'restock',
        quantity: 50,
        previousStock: 15,
        newStock: 65,
        date: '2024-01-10 14:30',
        reference: 'PO-2024-001',
        user: 'Warehouse Manager'
      },
      {
        id: 'LOG002',
        product: 'Smart Fitness Tracker',
        sku: 'SFT-002',
        type: 'sale',
        quantity: -15,
        previousStock: 23,
        newStock: 8,
        date: '2024-01-15 10:15',
        reference: 'Order #12345',
        user: 'WooCommerce Sync'
      },
      {
        id: 'LOG003',
        product: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        type: 'adjustment',
        quantity: -20,
        previousStock: 65,
        newStock: 45,
        date: '2024-01-15 16:45',
        reference: 'INV-ADJ-001',
        user: 'Inventory Team'
      }
    ],
    turnover: [
      {
        product: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        soldLast30Days: 35,
        averageStock: 40,
        turnoverRate: 0.875,
        daysOnHand: 34.3,
        performance: 'good'
      },
      {
        product: 'Smart Fitness Tracker',
        sku: 'SFT-002',
        soldLast30Days: 28,
        averageStock: 18,
        turnoverRate: 1.556,
        daysOnHand: 19.3,
        performance: 'excellent'
      },
      {
        product: 'Bluetooth Speaker Pro',
        sku: 'BSP-003',
        soldLast30Days: 45,
        averageStock: 12,
        turnoverRate: 3.75,
        daysOnHand: 8.0,
        performance: 'high-demand'
      }
    ]
  };

  const getStockStatus = (current: number, reorderPoint: number) => {
    if (current === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (current <= reorderPoint) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Adequate', color: 'bg-green-100 text-green-800' };
  };

  const getPerformanceColor = (performance: string) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'average': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800',
      'high-demand': 'bg-purple-100 text-purple-800'
    };
    return colors[performance] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-3">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Sync WooCommerce
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Package className="w-4 h-4 mr-2" />
                Stock Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>
                  Manually adjust inventory levels
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="adjustProduct">Select Product</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Premium Wireless Headphones (PWH-001)</option>
                    <option>Smart Fitness Tracker (SFT-002)</option>
                    <option>Bluetooth Speaker Pro (BSP-003)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input id="currentStock" value="45" disabled />
                  </div>
                  <div>
                    <Label htmlFor="adjustment">Adjustment (+/-)</Label>
                    <Input id="adjustment" type="number" placeholder="0" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Damaged goods</option>
                    <option>Count correction</option>
                    <option>Return to supplier</option>
                    <option>Physical count adjustment</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input id="reference" placeholder="Enter reference (optional)" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Apply Adjustment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">53</div>
            <p className="text-xs text-muted-foreground">
              Across all products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground">
              Needs immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6,344.92</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnover</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.06x</div>
            <p className="text-xs text-muted-foreground">
              Monthly turnover rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Stock</TabsTrigger>
          <TabsTrigger value="logs">Stock Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory Levels</CardTitle>
              <CardDescription>Real-time stock levels synced with WooCommerce</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.current.map((item) => {
                    const stockStatus = getStockStatus(item.currentStock, item.reorderPoint);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.currentStock}</span>
                            {item.currentStock <= item.reorderPoint && (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.reorderPoint}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.warehouseLocation}
                          </div>
                        </TableCell>
                        <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell>${item.totalValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Package className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Stock Settings</DialogTitle>
                                  <DialogDescription>
                                    Modify reorder points and safety stock levels
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="reorderPoint">Reorder Point</Label>
                                      <Input id="reorderPoint" type="number" defaultValue={item.reorderPoint} />
                                    </div>
                                    <div>
                                      <Label htmlFor="safetyStock">Safety Stock</Label>
                                      <Input id="safetyStock" type="number" defaultValue={item.safetyStock} />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="location">Warehouse Location</Label>
                                    <Input id="location" defaultValue={item.warehouseLocation} />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Update</Button>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Logs</CardTitle>
              <CardDescription>Complete history of all stock changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New Stock</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.stockLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.product}</TableCell>
                      <TableCell>
                        <Badge variant={log.type === 'restock' ? 'default' : log.type === 'sale' ? 'secondary' : 'outline'}>
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={log.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {log.quantity > 0 ? '+' : ''}{log.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{log.previousStock}</TableCell>
                      <TableCell>{log.newStock}</TableCell>
                      <TableCell className="font-mono text-sm">{log.reference}</TableCell>
                      <TableCell>{log.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover Analysis</CardTitle>
                <CardDescription>Product performance and turnover statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Sold (30d)</TableHead>
                      <TableHead>Avg Stock</TableHead>
                      <TableHead>Turnover Rate</TableHead>
                      <TableHead>Days on Hand</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.turnover.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>{item.soldLast30Days}</TableCell>
                        <TableCell>{item.averageStock}</TableCell>
                        <TableCell>{item.turnoverRate.toFixed(2)}x</TableCell>
                        <TableCell>{item.daysOnHand.toFixed(1)} days</TableCell>
                        <TableCell>
                          <Badge className={getPerformanceColor(item.performance)}>
                            {item.performance.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;
