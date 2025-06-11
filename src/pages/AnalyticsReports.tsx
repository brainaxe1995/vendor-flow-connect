
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, Package, DollarSign, Users, Clock, BarChart3, Filter } from 'lucide-react';

const AnalyticsReports = () => {
  const [dateRange, setDateRange] = useState('30d');

  // Mock analytics data
  const salesData = [
    { month: 'Jan', revenue: 12420, orders: 45, customers: 38 },
    { month: 'Feb', revenue: 15680, orders: 52, customers: 47 },
    { month: 'Mar', revenue: 18950, orders: 63, customers: 55 },
    { month: 'Apr', revenue: 16780, orders: 58, customers: 51 },
    { month: 'May', revenue: 21340, orders: 71, customers: 62 },
    { month: 'Jun', revenue: 19850, orders: 67, customers: 59 }
  ];

  const productPerformance = [
    { name: 'Wireless Headphones', sales: 156, revenue: 31200, margin: 35 },
    { name: 'Fitness Tracker', sales: 134, revenue: 20100, margin: 42 },
    { name: 'Bluetooth Speaker', sales: 98, revenue: 8820, margin: 28 },
    { name: 'Smart Watch', sales: 76, revenue: 22800, margin: 45 },
    { name: 'Phone Case', sales: 203, revenue: 6090, margin: 55 }
  ];

  const categoryBreakdown = [
    { name: 'Electronics', value: 45, sales: 2850000 },
    { name: 'Accessories', value: 30, sales: 1900000 },
    { name: 'Audio', value: 15, sales: 950000 },
    { name: 'Wearables', value: 10, sales: 630000 }
  ];

  const customerMetrics = [
    { metric: 'New Customers', month: 'Jan', value: 23 },
    { metric: 'New Customers', month: 'Feb', value: 31 },
    { metric: 'New Customers', month: 'Mar', value: 28 },
    { metric: 'New Customers', month: 'Apr', value: 35 },
    { metric: 'New Customers', month: 'May', value: 42 },
    { metric: 'New Customers', month: 'Jun', value: 38 }
  ];

  const keyMetrics = {
    totalRevenue: 125420,
    totalOrders: 356,
    averageOrderValue: 352.31,
    customerRetention: 78.5,
    conversionRate: 3.2,
    returnRate: 2.8
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val}%`;
      return val.toLocaleString();
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change && (
            <p className={`text-xs flex items-center mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(change)}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

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
            </select>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Revenue"
          value={keyMetrics.totalRevenue}
          change={15.2}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Orders"
          value={keyMetrics.totalOrders}
          change={8.3}
          icon={Package}
        />
        <MetricCard
          title="Avg Order Value"
          value={keyMetrics.averageOrderValue}
          change={-2.1}
          icon={TrendingUp}
          format="currency"
        />
        <MetricCard
          title="Customer Retention"
          value={keyMetrics.customerRetention}
          change={5.7}
          icon={Users}
          format="percentage"
        />
        <MetricCard
          title="Conversion Rate"
          value={keyMetrics.conversionRate}
          change={12.4}
          icon={BarChart3}
          format="percentage"
        />
        <MetricCard
          title="Return Rate"
          value={keyMetrics.returnRate}
          change={-3.2}
          icon={Clock}
          format="percentage"
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
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orders & Customers</CardTitle>
              <CardDescription>Monthly orders and customer acquisition</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                  <Bar dataKey="customers" fill="#82ca9d" name="New Customers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products ranked by sales volume and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.map((product, index) => (
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
                        {product.margin}% margin
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Sales Comparison</CardTitle>
              <CardDescription>Sales volume comparison across products</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productPerformance}>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers acquired over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={customerMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="New Customers" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Key customer behavior metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm font-medium">Lifetime Value</span>
                    <span className="font-bold">$847.50</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm font-medium">Average Session Duration</span>
                    <span className="font-bold">4m 32s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm font-medium">Repeat Purchase Rate</span>
                    <span className="font-bold">34.7%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="font-bold">4.6/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Customer categorization by purchasing behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium">High Value</h4>
                  <p className="text-2xl font-bold text-green-600">23%</p>
                  <p className="text-sm text-muted-foreground">$1000+ purchases</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium">Regular</h4>
                  <p className="text-2xl font-bold text-blue-600">45%</p>
                  <p className="text-sm text-muted-foreground">$200-$999 purchases</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium">Occasional</h4>
                  <p className="text-2xl font-bold text-orange-600">32%</p>
                  <p className="text-sm text-muted-foreground">Under $200 purchases</p>
                </div>
              </div>
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
                    <select className="w-full p-2 border rounded-md mt-1">
                      <option>Sales Summary</option>
                      <option>Product Performance</option>
                      <option>Customer Analysis</option>
                      <option>Financial Overview</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <select className="w-full p-2 border rounded-md mt-1">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last quarter</option>
                      <option>Last year</option>
                      <option>Custom range</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Metrics to Include</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Revenue', 'Orders', 'Customers', 'Products', 'Returns', 'Profit'].map((metric) => (
                      <label key={metric} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Template</Button>
                  <Button>Generate Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automatically generated reports sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Weekly Sales Summary', 'Monthly Product Performance', 'Quarterly Financial Report'].map((report, index) => (
                  <div key={report} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report}</h4>
                      <p className="text-sm text-muted-foreground">
                        Next delivery: {new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Pause</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;
