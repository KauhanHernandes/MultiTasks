export interface MarketItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  completed: boolean;
  month: string; // YYYY-MM format
  section_name: string;
  is_finalized: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeItem {
  id: string;
  name: string;
  completed: boolean;
  month: string; // YYYY-MM format
  created_at: string;
  updated_at: string;
}

export interface MonthlyStats {
  month: string;
  totalItems: number;
  completedItems: number;
  totalSpent: number;
  homeTasksTotal: number;
  homeTasksCompleted: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  expiry_date?: string;
  month: string; // YYYY-MM format
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudget {
  id: string;
  month: string; // YYYY-MM format
  budget_amount: number;
  created_at: string;
  updated_at: string;
}