
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShoppingCart,
  DollarSign,
  Warehouse,
  RefreshCw,
  CreditCard,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';

const SupplierLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: Package, label: 'Order Management', path: '/orders', badge: 24 },
    { icon: Truck, label: 'Logistics & Shipping', path: '/logistics', badge: 3 },
    { icon: ShoppingCart, label: 'Product Management', path: '/products', badge: null },
    { icon: DollarSign, label: 'Sourcing & Pricing', path: '/sourcing', badge: null },
    { icon: Warehouse, label: 'Inventory Management', path: '/inventory', badge: 7 },
    { icon: RefreshCw, label: 'Refunds & Disputes', path: '/refunds', badge: 3 },
    { icon: CreditCard, label: 'Payments & Billing', path: '/payments', badge: null },
    { icon: MessageSquare, label: 'Communication Center', path: '/communication', badge: 5 },
    { icon: FileText, label: 'Compliance & Docs', path: '/compliance', badge: null },
    { icon: BarChart3, label: 'Analytics & Reports', path: '/analytics', badge: null },
    { icon: Settings, label: 'Settings & API', path: '/settings', badge: null },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Supplier Portal</h1>
                <p className="text-xs text-muted-foreground">WooCommerce Integration</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${sidebarOpen ? 'px-3' : 'px-2'}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4" />
                {sidebarOpen && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs w-5 h-5 p-0 flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">Supplier Admin</p>
                <p className="text-xs text-muted-foreground">admin@supplier.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div>
              <h2 className="font-semibold text-lg">
                {navigationItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your supplier operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs w-5 h-5 p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;
