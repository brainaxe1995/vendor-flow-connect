
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Package, Truck, ShoppingCart, DollarSign, BarChart3, FileText, Settings, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '../AppHeader';

const SupplierLayout = () => {
  const { user } = useAuth();

  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'Orders', url: '/orders', icon: ShoppingCart },
    { title: 'Logistics & Shipping', url: '/logistics', icon: Truck },
    { title: 'Products', url: '/products', icon: Package },
    { title: 'Sourcing & Pricing', url: '/sourcing', icon: DollarSign },
    { title: 'Inventory', url: '/inventory', icon: Package },
    { title: 'Refunds & Disputes', url: '/refunds', icon: FileText },
    { title: 'Payments & Billing', url: '/payments', icon: DollarSign },
    { title: 'Compliance & Docs', url: '/compliance', icon: FileText },
    { title: 'Analytics & Reports', url: '/analytics', icon: BarChart3 },
    { title: 'Settings & API', url: '/settings', icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SupplierLayout;
