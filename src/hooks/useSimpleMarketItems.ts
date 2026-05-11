import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SimpleMarketItem {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
  month: string;
  created_at: string;
  updated_at: string;
}

export const useSimpleMarketItems = (month: string) => {
  const [items, setItems] = useState<SimpleMarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('simple_market_items')
        .select('*')
        .eq('month', month)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching simple market items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('simple_market_items')
        .insert({
          name,
          quantity,
          completed: false,
          month,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      setItems(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding simple market item:', error);
    }
  };

  const updateItem = async (id: string, updates: Partial<SimpleMarketItem>) => {
    try {
      const { error } = await supabase
        .from('simple_market_items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating simple market item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('simple_market_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting simple market item:', error);
    }
  };

  const toggleCompleted = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await updateItem(id, { completed: !item.completed });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [month]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
  };
};