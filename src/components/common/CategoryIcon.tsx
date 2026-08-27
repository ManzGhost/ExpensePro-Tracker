import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  GraduationCap,
  Sparkles,
  Tag,
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  Wallet,
  Coffee,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { ExpenseCategory, PaymentMethod } from '../../types';

interface CategoryIconProps extends LucideProps {
  name: ExpenseCategory | string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, size = 18, className = '', ...props }) => {
  switch (name) {
    case 'Food & Dining':
      return <Utensils size={size} className={className} {...props} />;
    case 'Groceries':
      return <ShoppingCart size={size} className={className} {...props} />;
    case 'Transportation':
      return <Car size={size} className={className} {...props} />;
    case 'Housing & Rent':
      return <Home size={size} className={className} {...props} />;
    case 'Utilities':
      return <Zap size={size} className={className} {...props} />;
    case 'Entertainment':
      return <Film size={size} className={className} {...props} />;
    case 'Healthcare':
      return <HeartPulse size={size} className={className} {...props} />;
    case 'Shopping':
      return <ShoppingBag size={size} className={className} {...props} />;
    case 'Travel':
      return <Plane size={size} className={className} {...props} />;
    case 'Education':
      return <GraduationCap size={size} className={className} {...props} />;
    case 'Personal Care':
      return <Sparkles size={size} className={className} {...props} />;
    case 'Other':
      return <Tag size={size} className={className} {...props} />;
    case 'Coffee':
      return <Coffee size={size} className={className} {...props} />;
    default:
      return <HelpCircle size={size} className={className} {...props} />;
  }
};

interface PaymentIconProps extends LucideProps {
  method: PaymentMethod | string;
  size?: number;
  className?: string;
}

export const PaymentIcon: React.FC<PaymentIconProps> = ({ method, size = 16, className = '', ...props }) => {
  switch (method) {
    case 'Credit Card':
      return <CreditCard size={size} className={className} {...props} />;
    case 'Debit Card':
      return <CreditCard size={size} className={className} {...props} />;
    case 'Cash':
      return <Banknote size={size} className={className} {...props} />;
    case 'UPI':
      return <Smartphone size={size} className={className} {...props} />;
    case 'Bank Transfer':
      return <Landmark size={size} className={className} {...props} />;
    case 'Digital Wallet':
      return <Wallet size={size} className={className} {...props} />;
    default:
      return <Wallet size={size} className={className} {...props} />;
  }
};
