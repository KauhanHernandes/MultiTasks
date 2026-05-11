import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MonthlyBudget } from '../types';

export const useMonthlyBudget = (month: string) => {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('month', month)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      setBudget(data || null);
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const setBudgetAmount = async (amount: number) => {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .upsert({
          month,
          budget_amount: amount,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      setBudget(data);
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  const resetBudget = async () => {
    try {
      const { error } = await supabase
        .from('monthly_budgets')
        .delete()
        .eq('month', month);
      
      if (error) throw error;
      setBudget(null);
    } catch (error) {
      console.error('Error resetting budget:', error);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [month]);

  return {
    budget,
    loading,
    setBudgetAmount,
    resetBudget, 
  };
};