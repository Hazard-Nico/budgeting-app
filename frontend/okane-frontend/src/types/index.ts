export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: 'en' | 'id';
  currency: string;
  is_setup_complete: boolean;
  profile?: UserProfile;
  balance?: AccountBalance;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  avatar?: string;
  bio: string;
  monthly_income_goal: number;
  monthly_savings_goal: number;
}

export interface AccountBalance {
  id: number;
  current_balance: number;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_type: 'income' | 'expense' | 'saving';
  category?: 'survival' | 'optional' | 'culture' | 'extra';
  amount: number;
  description: string;
  notes?: string;
  date: string;
  shopping_group?: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudget {
  id: number;
  month: number;
  year: number;
  planned_income: number;
  actual_income: number;
  planned_fixed_expenses: number;
  actual_fixed_expenses: number;
  planned_survival: number;
  actual_survival: number;
  planned_optional: number;
  actual_optional: number;
  planned_culture: number;
  actual_culture: number;
  planned_extra: number;
  actual_extra: number;
  planned_savings: number;
  actual_savings: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsTracker {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  description?: string;
  is_completed: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}