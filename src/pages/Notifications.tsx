
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2, Filter } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  category: 'orders' | 'inventory' | 'shipping' | 'system';
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'Order #7250 has been placed by ARTURS VEZNOVECS and needs processing. Total amount: $45.99',
      timestamp: '2024-06-09 14:30:00',
      type: 'info',
      read: false,
      category: 'orders'
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Test Adipine (Adipine XL / Adipine MR) stock is running low. Current stock: 5 items. Consider reordering.',
      timestamp: '2024-06-09 13:15:00',
      type: 'warning',
      read: false,
      category: 'inventory'
    },
    {
      id: '3',
      title: 'Shipment Delivered',
      message: 'Order #7242 for Rebecca Mcallister has been successfully delivered to Belfast, BT14 7EJ, GB',
      timestamp: '2024-06-09 12:00:00',
      type: 'success',
      read: true,
      category: 'shipping'
    },
    {
      id: '4',
      title: 'Payment Failed',
      message: 'Payment for order #7235 failed. Customer has been notified to update payment method.',
      timestamp: '2024-06-09 10:45:00',
      type: 'error',
      read: false,
      category: 'orders'
    },
    {
      id: '5',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
      timestamp: '2024-06-08 16:00:00',
      type: 'info',
      read: true,
      category: 'system'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'orders':
        return notifications.filter(n => n.category === 'orders');
      case 'inventory':
        return notifications.filter(n => n.category === 'inventory');
      case 'shipping':
        return notifications.filter(n => n.category === 'shipping');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your store activities and alerts
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All <Badge variant="secondary">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Unread <Badge variant="destructive">{unreadCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            Orders <Badge variant="secondary">{notifications.filter(n => n.category === 'orders').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            Inventory <Badge variant="secondary">{notifications.filter(n => n.category === 'inventory').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            Shipping <Badge variant="secondary">{notifications.filter(n => n.category === 'shipping').length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications found</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Badge className={getNotificationBadgeColor(notification.type)} variant="outline">
                            {notification.type}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
