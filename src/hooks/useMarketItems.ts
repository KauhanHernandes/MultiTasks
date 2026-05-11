import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MarketItem } from '../types';

export const useMarketItems = (month: string) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('month', month)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching market items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string, price: number, quantity: number, sectionName: string = '') => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .insert({
          name,
          price,
          quantity,
          completed: false,
          month,
          section_name: sectionName,
          is_finalized: false,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      setItems(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding market item:', error);
    }
  };

  const updateItem = async (id: string, updates: Partial<MarketItem>) => {
    try {
      const { error } = await supabase
        .from('market_items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating market item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('market_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting market item:', error);
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

  const totalValue = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const completedValue = totalValue; // Auto-update: all added items count as spent

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
    totalValue,
    completedValue,
  };
};