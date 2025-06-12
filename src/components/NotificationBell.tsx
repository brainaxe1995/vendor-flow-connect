
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const NotificationBell = () => {
  const { user } = useSupabaseAuth();
  const { notifications, markAsRead, markAllAsRead } = useSupabaseNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'product':
        return '📦';
      case 'system':
        return '⚙️';
      case 'compliance':
        return '⚠️';
      case 'payment':
        return '💰';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (!user) {
    return null; // Don't show notifications if user is not logged in
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-auto p-1"
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex flex-col items-start space-y-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-2 w-full">
                  <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.created_at || '')}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-muted-foreground">
                  {notifications.length - 5} more notifications
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <DropdownMenuItem className="text-center text-sm text-muted-foreground">
            No notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
