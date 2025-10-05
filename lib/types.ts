export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  category: string;
  status: 'upcoming' | 'paid';
  created_at: string; // ISO timestamp
}

export interface Category {
  id: string;
  name: string;
  is_visible: boolean;
  color?: string;
  order_index?: number;
  // Enhanced fields for Categories tab
  type?: 'income' | 'expense';
  icon?: string;
  budget_enabled?: boolean;
}

export interface AppSettings {
  passcode_hash?: string;
}

export interface Budget {
  id: string;
  category: string; // category name for now (can migrate to category_id later)
  allocated_amount: number;
  spent_amount: number;
  month: string; // YYYY-MM
  is_active: boolean;
}

