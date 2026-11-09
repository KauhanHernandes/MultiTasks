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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

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
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Market] Insert error:', error);
      throw new Error(`Erro: ${error.message} (code: ${error.code}, hint: ${error.hint || 'none'})`);
    }
    setItems(prev => [data, ...prev]);
    return data;
  };

  const updateItem = async (id: string, updates: Partial<MarketItem>) => {
    const { error } = await supabase
      .from('market_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('market_items')
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

  const totalValue = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const completedValue = totalValue;

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