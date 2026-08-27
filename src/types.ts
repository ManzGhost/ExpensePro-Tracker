export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Housing & Rent'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Travel'
  | 'Education'
  | 'Personal Care'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Bank Transfer'
  | 'Digital Wallet';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number; // timestamp
  updatedAt?: number;
}

export type DateRangeOption =
  | 'all'
  | 'this_month'
  | 'last_month'
  | 'last_30_days'
  | 'this_year'
  | 'custom';

export type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'amount_desc'
  | 'amount_asc'
  | 'title_asc'
  | 'title_desc';

export interface ExpenseFilters {
  searchQuery: string;
  category: ExpenseCategory | 'all';
  paymentMethod: PaymentMethod | 'all';
  dateRange: DateRangeOption;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: SortOption;
}

export interface BudgetConfig {
  monthlyBudget: number;
  currencySymbol: string;
  currencyCode: string;
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>;
}

export type ToastType = 'success' | 'info' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface CategoryInfo {
  name: ExpenseCategory;
  iconName: string;
  colorBg: string;
  colorText: string;
  colorHex: string;
  lightBg: string;
  borderClass: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  rememberMe?: boolean;
}
