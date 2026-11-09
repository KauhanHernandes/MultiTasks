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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('home_items')
      .insert({
        name,
        completed: false,
        month,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Home] Insert error:', error);
      throw new Error(`Erro: ${error.message} (code: ${error.code}, hint: ${error.hint || 'none'})`);
    }
    setItems(prev => [data, ...prev]);
    return data;
  };

  const updateItem = async (id: string, updates: Partial<HomeItem>) => {
    const { error } = await supabase
      .from('home_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('home_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.filter(item => item.id !== id));
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