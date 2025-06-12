
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useSupabaseAuth } from './useSupabaseAuth';

type ProductProposal = Tables<'product_proposals'>;
type ProductProposalInsert = TablesInsert<'product_proposals'>;
type ProductProposalUpdate = TablesUpdate<'product_proposals'>;

export const useSupabaseProposals = () => {
  const { user } = useSupabaseAuth();
  const [proposals, setProposals] = useState<ProductProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProposals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_proposals')
        .select('*')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposal: Omit<ProductProposalInsert, 'supplier_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('product_proposals')
        .insert({
          ...proposal,
          supplier_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh proposals list
      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  };

  const updateProposal = async (id: string, updates: ProductProposalUpdate) => {
    try {
      const { data, error } = await supabase
        .from('product_proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh proposals list
      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  return {
    proposals,
    loading,
    fetchProposals,
    createProposal,
    updateProposal
  };
};
