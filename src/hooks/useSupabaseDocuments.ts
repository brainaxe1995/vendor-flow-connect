
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useSupabaseAuth } from './useSupabaseAuth';

type ComplianceDocument = Tables<'compliance_documents'>;
type ComplianceDocumentInsert = TablesInsert<'compliance_documents'>;
type ComplianceDocumentUpdate = TablesUpdate<'compliance_documents'>;

export const useSupabaseDocuments = () => {
  const { user } = useSupabaseAuth();
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('compliance_documents')
        .select('*')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (document: Omit<ComplianceDocumentInsert, 'supplier_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('compliance_documents')
        .insert({
          ...document,
          supplier_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh documents list
      await fetchDocuments();
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  const updateDocument = async (id: string, updates: ComplianceDocumentUpdate) => {
    try {
      const { data, error } = await supabase
        .from('compliance_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh documents list
      await fetchDocuments();
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('compliance_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument
  };
};
