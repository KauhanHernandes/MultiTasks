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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('simple_market_items')
      .insert({
        name,
        quantity,
        completed: false,
        month,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[SimpleMarket] Insert error:', error);
      throw new Error(`Erro: ${error.message} (code: ${error.code}, hint: ${error.hint || 'none'})`);
    }
    setItems(prev => [data, ...prev]);
    return data;
  };

  const updateItem = async (id: string, updates: Partial<SimpleMarketItem>) => {
    const { error } = await supabase
      .from('simple_market_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('simple_market_items')
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