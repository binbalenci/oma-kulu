export interface ExpectedIncome {
  id: string;
  name: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
  is_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ExpectedInvoice {
  id: string;
  name: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
  is_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  category: string;
  allocated_amount: number;
  month: string; // YYYY-MM
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ExpectedSavings {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
  target?: number; // Optional target amount (persists across months)
  is_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  category: string;
  status: 'upcoming' | 'paid';
  created_at: string; // ISO timestamp
  source_type?: 'income' | 'invoice' | 'savings'; // Type of expected item this transaction was created from
  source_id?: string; // ID of the expected income/invoice/savings item
  uses_savings_category?: string; // Category name if using savings
  savings_amount_used?: number; // Amount used from savings balance
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'saving';
  emoji?: string;
  color?: string;
  is_visible: boolean;
  budget_enabled?: boolean;
  order_index?: number;
  created_at?: string;
}

export interface AppSettings {
  id?: number;
  passcode_hash?: string;
  starting_balance?: number;
  updated_at?: string;
}

