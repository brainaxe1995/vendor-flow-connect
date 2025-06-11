
import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  RotateCcw, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { useWooCommerceConfig, useNotifications } from '../../hooks/useWooCommerce';
import { useAuth } from '../../contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AppLayout = () => {
  const location = useLocation();
  const { config, isConfigured } = useWooCommerceConfig();
  const { data: notifications } = useNotifications();
  const { user, logout } = useAuth();
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      title: "Logistics & Shipping",
      url: "/logistics",
      icon: Truck,
      badge: null
    },
    {
      title: "Inventory Management",
      url: "/inventory",
      icon: Package,
      badge: null
    },
    {
      title: "Refunds & Disputes",
      url: "/refunds",
      icon: RotateCcw,
      badge: null
    },
    {
      title: "Sourcing & Pricing",
      url: "/sourcing",
      icon: DollarSign,
      badge: null
    },
    {
      title: "Payments & Billing",
      url: "/payments",
      icon: DollarSign,
      badge: null
    },
    {
      title: "Compliance & Documents",
      url: "/compliance",
      icon: FileText,
      badge: null
    },
    {
      title: "Settings & API",
      url: "/settings",
      icon: Settings,
      badge: null
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="p-4">
              <h2 className="text-lg font-bold">Vendor Portal</h2>
              {config && (
                <p className="text-xs text-muted-foreground">
                  {config.storeUrl?.replace('https://', '').replace('http://', '')}
                </p>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1">
          <header className="border-b p-4 flex items-center justify-between">
            <SidebarTrigger />
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white">
                  <div className="p-2">
                    <h4 className="font-medium mb-2">Notifications</h4>
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-2">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.message}</div>
                          <div className="text-xs text-muted-foreground">{new Date(notification.time).toLocaleString()}</div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">No notifications</div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Info & Logout */}
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>
          
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
