
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShoppingCart,
  DollarSign,
  Warehouse,
  RefreshCw,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Bell,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const SupplierLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: Package, label: 'Order Management', path: '/orders', badge: 24 },
    { icon: Truck, label: 'Logistics & Shipping', path: '/logistics', badge: 3 },
    { icon: ShoppingCart, label: 'Product Management', path: '/products', badge: null },
    { icon: DollarSign, label: 'Sourcing & Pricing', path: '/sourcing', badge: null },
    { icon: Warehouse, label: 'Inventory Management', path: '/inventory', badge: 7 },
    { icon: RefreshCw, label: 'Refunds & Disputes', path: '/refunds', badge: 3 },
    { icon: CreditCard, label: 'Payments & Billing', path: '/payments', badge: null },
    { icon: FileText, label: 'Compliance & Docs', path: '/compliance', badge: null },
    { icon: BarChart3, label: 'Analytics & Reports', path: '/analytics', badge: null },
    { icon: Settings, label: 'Settings & API', path: '/settings', badge: null },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
  };

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
                className={`w-full justify-start h-10 ${sidebarOpen ? 'px-3' : 'px-2'} relative`}
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
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {user?.role}
                  </Badge>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
            
            {!sidebarOpen && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="w-8 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
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
