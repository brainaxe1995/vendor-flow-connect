
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useSupabaseAuth } from './useSupabaseAuth';

type PriceUpdateRequest = Tables<'price_update_requests'>;
type PriceUpdateRequestInsert = TablesInsert<'price_update_requests'>;
type PriceUpdateRequestUpdate = TablesUpdate<'price_update_requests'>;

export const useSupabasePriceRequests = () => {
  const { user } = useSupabaseAuth();
  const [priceRequests, setPriceRequests] = useState<PriceUpdateRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPriceRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('price_update_requests')
        .select('*')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPriceRequests(data || []);
    } catch (error) {
      console.error('Error fetching price requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPriceRequest = async (request: Omit<PriceUpdateRequestInsert, 'supplier_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('price_update_requests')
        .insert({
          ...request,
          supplier_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh price requests list
      await fetchPriceRequests();
      return data;
    } catch (error) {
      console.error('Error creating price request:', error);
      throw error;
    }
  };

  const updatePriceRequest = async (id: string, updates: PriceUpdateRequestUpdate) => {
    try {
      const { data, error } = await supabase
        .from('price_update_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh price requests list
      await fetchPriceRequests();
      return data;
    } catch (error) {
      console.error('Error updating price request:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPriceRequests();
    }
  }, [user]);

  return {
    priceRequests,
    loading,
    fetchPriceRequests,
    createPriceRequest,
    updatePriceRequest
  };
};
