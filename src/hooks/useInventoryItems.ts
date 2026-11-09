import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { InventoryItem } from '../types';

export const useInventoryItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string, quantity: number, expiryDate?: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name,
        quantity,
        expiry_date: expiryDate || null,
        month: currentMonth,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Inventory] Insert error:', error);
      throw new Error(`Erro: ${error.message} (code: ${error.code}, hint: ${error.hint || 'none'})`);
    }
    setItems(prev => [data, ...prev]);
    return data;
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const { error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
  };
};