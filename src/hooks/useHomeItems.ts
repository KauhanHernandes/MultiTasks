import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { HomeItem } from '../types';

export const useHomeItems = (month: string) => {
  const [items, setItems] = useState<HomeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('home_items')
        .select('*')
        .eq('month', month)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching home items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('home_items')
        .insert({
          name,
          completed: false,
          month,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      setItems(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding home item:', error);
    }
  };

  const updateItem = async (id: string, updates: Partial<HomeItem>) => {
    try {
      const { error } = await supabase
        .from('home_items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating home item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('home_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting home item:', error);
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