import { createClient } from '@supabase/supabase-js';
import type { MarketItem, HomeItem, InventoryItem, MonthlyBudget } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      market_items: {
        Row: MarketItem;
        Insert: Omit<MarketItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MarketItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      home_items: {
        Row: HomeItem;
        Insert: Omit<HomeItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HomeItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      monthly_budgets: {
        Row: MonthlyBudget;
        Insert: Omit<MonthlyBudget, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MonthlyBudget, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}