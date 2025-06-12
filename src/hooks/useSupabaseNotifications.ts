
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useSupabaseAuth } from './useSupabaseAuth';

type Notification = Tables<'notifications'>;
type NotificationInsert = TablesInsert<'notifications'>;
type NotificationUpdate = TablesUpdate<'notifications'>;

export const useSupabaseNotifications = () => {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notification: Omit<NotificationInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh notifications list
      await fetchNotifications();
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh notifications list
      await fetchNotifications();
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
      // Refresh notifications list
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return {
    notifications,
    loading,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
  };
};
