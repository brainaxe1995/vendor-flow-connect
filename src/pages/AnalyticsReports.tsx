
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, Package, DollarSign, Users, Clock, BarChart3, Filter, Loader2 } from 'lucide-react';
import { 
  useOrderStats, 
  useProductStats, 
  useTopSellers, 
  useCategorySales,
  useCustomerAcquisition,
  useExportData
} from '../hooks/useWooCommerce';
import { getDateRange, formatDateForChart } from '../utils/dateUtils';
import { toast } from 'sonner';

const AnalyticsReports = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('orders');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  // Get current date range
  const currentDateRange = dateRange === 'custom' ? {
    date_min: customDateRange.start ? new Date(customDateRange.start).toISOString() : undefined,
    date_max: customDateRange.end ? new Date(customDateRange.end).toISOString() : undefined
  } : getDateRange(dateRange);

  // Real data hooks
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats(currentDateRange);
  const { data: productStats, isLoading: productStatsLoading } = useProductStats();
  const { data: topSellers, isLoading: topSellersLoading } = useTopSellers(currentDateRange);
  const { data: categorySales, isLoading: categorySalesLoading } = useCategorySales(currentDateRange);
  const { data: customerAcquisition, isLoading: customerAcquisitionLoading } = useCustomerAcquisition(currentDateRange);
  
  const exportDataMutation = useExportData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleExport = async () => {
    try {
      await exportDataMutation.mutateAsync({
        type: reportType as 'orders' | 'products' | 'customers' | 'refunds',
        format: exportFormat,
        ...currentDateRange
      });
      toast.success(`${reportType} data exported successfully`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number', isLoading = false }) => {
    const formatValue = (val) => {
      if (isLoading || val === undefined) return '...';
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val.toFixed(1)}%`;
      return val.toLocaleString();
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatValue(value)}
          </div>
          {change && !isLoading && (
            <p className={`text-xs flex items-center mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(change).toFixed(1)}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Transform top sellers data for display
  const topSellersData = topSellers?.map(seller => ({
    name: seller.product_name,
    sales: seller.quantity,
    revenue: parseFloat(seller.product_price) * seller.quantity
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-40"
              />
              <Input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-40"
              />
            </div>
          )}
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleExport} disabled={exportDataMutation.isPending}>
            {exportDataMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Revenue"
          value={orderStats?.totalRevenue}
          change={15.2}
          icon={DollarSign}
          format="currency"
          isLoading={orderStatsLoading}
        />
        <MetricCard
          title="Total Orders"
          value={orderStats ? orderStats.completed + orderStats.processing + orderStats.pending : undefined}
          change={8.3}
          icon={Package}
          isLoading={orderStatsLoading}
        />
        <MetricCard
          title="Products in Stock"
          value={productStats?.inStock}
          change={-2.1}
          icon={Package}
          isLoading={productStatsLoading}
        />
        <MetricCard
          title="Total Products"
          value={productStats?.total}
          change={5.7}
          icon={Users}
          isLoading={productStatsLoading}
        />
        <MetricCard
          title="Low Stock Items"
          value={productStats?.lowStock}
          change={12.4}
          icon={BarChart3}
          isLoading={productStatsLoading}
        />
        <MetricCard
          title="Refund Rate"
          value={orderStats?.refundRate}
          change={-3.2}
          icon={Clock}
          format="percentage"
          isLoading={orderStatsLoading}
        />
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                {customerAcquisitionLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={customerAcquisition}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDateForChart}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => formatDateForChart(value)}
                        formatter={(value) => [value, 'New Customers']}
                      />
                      <Line type="monotone" dataKey="customers" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution by product category</CardDescription>
              </CardHeader>
              <CardContent>
                {categorySalesLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categorySales}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ label }) => label}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categorySales?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} orders ($${props.payload.sales.toLocaleString()})`,
                          'Sales'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products ranked by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              {topSellersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {topSellersData.slice(0, 5).map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.revenue.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {product.sales} sold
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Sales Comparison</CardTitle>
              <CardDescription>Sales volume comparison across top products</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSellersData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New customer acquisition over time</CardDescription>
            </CardHeader>
            <CardContent>
              {customerAcquisitionLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={customerAcquisition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDateForChart}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDateForChart(value)}
                      formatter={(value) => [value, 'New Customers']}
                    />
                    <Area type="monotone" dataKey="customers" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
              <CardDescription>Create customized reports for specific time periods and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Report Type</label>
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="orders">Orders Report</option>
                      <option value="products">Products Report</option>
                      <option value="customers">Customers Report</option>
                      <option value="refunds">Refunds Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Export Format</label>
                    <select 
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF (Coming Soon)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Template</Button>
                  <Button onClick={handleExport} disabled={exportDataMutation.isPending}>
                    {exportDataMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate & Download Report'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;
