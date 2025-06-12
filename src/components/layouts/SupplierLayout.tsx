
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/NotificationBell';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
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
  const { user, signOut } = useSupabaseAuth();

  // Determine user role from email (admin emails contain 'admin' or 'tharavix')
  const userRole = user?.email?.toLowerCase().includes('admin') || user?.email?.toLowerCase().includes('tharavix') ? 'admin' : 'supplier';

  const allNavigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null, roles: ['admin', 'supplier'] },
    { icon: Package, label: 'Order Management', path: '/orders', badge: 24, roles: ['admin', 'supplier'] },
    { icon: Truck, label: 'Logistics & Shipping', path: '/logistics', badge: 3, roles: ['admin', 'supplier'] },
    { icon: ShoppingCart, label: 'Product Management', path: '/products', badge: null, roles: ['admin'] },
    { icon: DollarSign, label: 'Sourcing & Pricing', path: '/sourcing', badge: null, roles: ['admin'] },
    { icon: Warehouse, label: 'Inventory Management', path: '/inventory', badge: 7, roles: ['admin'] },
    { icon: RefreshCw, label: 'Refunds & Disputes', path: '/refunds', badge: 3, roles: ['admin', 'supplier'] },
    { icon: CreditCard, label: 'Payments & Billing', path: '/payments', badge: null, roles: ['admin'] },
    { icon: FileText, label: 'Compliance & Docs', path: '/compliance', badge: null, roles: ['admin', 'supplier'] },
    { icon: BarChart3, label: 'Analytics & Reports', path: '/analytics', badge: null, roles: ['admin', 'supplier'] },
    { icon: Settings, label: 'Settings & API', path: '/settings', badge: null, roles: ['admin'] },
  ];

  // Filter navigation items based on user role
  const navigationItems = allNavigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get real order counts from API or context if available
  const getOrderCount = (path: string) => {
    // This would ideally come from a global state or API call
    // For now, return placeholder values that will be updated
    const counts: Record<string, number> = {
      '/orders': 0, // Will be updated with real data
      '/logistics': 0,
      '/inventory': 0,
      '/refunds': 0,
    };
    return counts[path] || null;
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
            {navigationItems.map((item) => {
              const badgeCount = getOrderCount(item.path) || item.badge;
              return (
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
                      {badgeCount && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {badgeCount}
                        </Badge>
                      )}
                    </>
                  )}
                  {!sidebarOpen && badgeCount && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs w-5 h-5 p-0 flex items-center justify-center">
                      {badgeCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
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
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {userRole}
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
                Manage your {userRole === 'admin' ? 'admin' : 'supplier'} operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;
