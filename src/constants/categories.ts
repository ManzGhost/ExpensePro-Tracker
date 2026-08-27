import { ExpenseCategory, PaymentMethod, CategoryInfo } from '../types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Housing & Rent',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Travel',
  'Education',
  'Personal Care',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI',
  'Bank Transfer',
  'Digital Wallet',
];

export const CATEGORY_DETAILS: Record<ExpenseCategory, CategoryInfo> = {
  'Food & Dining': {
    name: 'Food & Dining',
    iconName: 'Utensils',
    colorBg: 'bg-amber-500',
    colorText: 'text-amber-400',
    colorHex: '#F59E0B',
    lightBg: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
  },
  'Groceries': {
    name: 'Groceries',
    iconName: 'ShoppingCart',
    colorBg: 'bg-emerald-500',
    colorText: 'text-emerald-400',
    colorHex: '#10B981',
    lightBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
  },
  'Transportation': {
    name: 'Transportation',
    iconName: 'Car',
    colorBg: 'bg-sky-500',
    colorText: 'text-sky-400',
    colorHex: '#0EA5E9',
    lightBg: 'bg-sky-500/10',
    borderClass: 'border-sky-500/20',
  },
  'Housing & Rent': {
    name: 'Housing & Rent',
    iconName: 'Home',
    colorBg: 'bg-indigo-500',
    colorText: 'text-indigo-400',
    colorHex: '#6366F1',
    lightBg: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/20',
  },
  'Utilities': {
    name: 'Utilities',
    iconName: 'Zap',
    colorBg: 'bg-yellow-500',
    colorText: 'text-yellow-400',
    colorHex: '#EAB308',
    lightBg: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/20',
  },
  'Entertainment': {
    name: 'Entertainment',
    iconName: 'Film',
    colorBg: 'bg-purple-500',
    colorText: 'text-purple-400',
    colorHex: '#A855F7',
    lightBg: 'bg-purple-500/10',
    borderClass: 'border-purple-500/20',
  },
  'Healthcare': {
    name: 'Healthcare',
    iconName: 'HeartPulse',
    colorBg: 'bg-rose-500',
    colorText: 'text-rose-400',
    colorHex: '#F43F5E',
    lightBg: 'bg-rose-500/10',
    borderClass: 'border-rose-500/20',
  },
  'Shopping': {
    name: 'Shopping',
    iconName: 'ShoppingBag',
    colorBg: 'bg-pink-500',
    colorText: 'text-pink-400',
    colorHex: '#EC4899',
    lightBg: 'bg-pink-500/10',
    borderClass: 'border-pink-500/20',
  },
  'Travel': {
    name: 'Travel',
    iconName: 'Plane',
    colorBg: 'bg-teal-500',
    colorText: 'text-teal-400',
    colorHex: '#14B8A6',
    lightBg: 'bg-teal-500/10',
    borderClass: 'border-teal-500/20',
  },
  'Education': {
    name: 'Education',
    iconName: 'GraduationCap',
    colorBg: 'bg-blue-500',
    colorText: 'text-blue-400',
    colorHex: '#3B82F6',
    lightBg: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20',
  },
  'Personal Care': {
    name: 'Personal Care',
    iconName: 'Sparkles',
    colorBg: 'bg-fuchsia-500',
    colorText: 'text-fuchsia-400',
    colorHex: '#D946EF',
    lightBg: 'bg-fuchsia-500/10',
    borderClass: 'border-fuchsia-500/20',
  },
  'Other': {
    name: 'Other',
    iconName: 'Tag',
    colorBg: 'bg-slate-500',
    colorText: 'text-slate-400',
    colorHex: '#64748B',
    lightBg: 'bg-slate-500/10',
    borderClass: 'border-slate-500/20',
  },
};

export interface QuickPreset {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  icon: string;
}

export const QUICK_PRESETS: QuickPreset[] = [
  { id: 'p1', title: 'Morning Coffee', amount: 4.5, category: 'Food & Dining', paymentMethod: 'Credit Card', icon: 'Coffee' },
  { id: 'p2', title: 'Lunch Meal', amount: 14.5, category: 'Food & Dining', paymentMethod: 'Credit Card', icon: 'Utensils' },
  { id: 'p3', title: 'Weekly Groceries', amount: 68.2, category: 'Groceries', paymentMethod: 'Debit Card', icon: 'ShoppingCart' },
  { id: 'p4', title: 'Ride / Gas', amount: 25.0, category: 'Transportation', paymentMethod: 'Credit Card', icon: 'Car' },
  { id: 'p5', title: 'Movie / Streaming', amount: 16.99, category: 'Entertainment', paymentMethod: 'Digital Wallet', icon: 'Film' },
  { id: 'p6', title: 'Pharmacy & Meds', amount: 22.5, category: 'Healthcare', paymentMethod: 'Debit Card', icon: 'HeartPulse' },
];

export const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
];
