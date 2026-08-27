import { Expense, ExpenseCategory, PaymentMethod } from '../types';

export const formatCurrency = (amount: number, symbol = '$', code = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: amount % 1 === 0 ? 2 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getMonthName = (monthIndex: number): string => {
  const date = new Date(2025, monthIndex, 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const calculateTotals = (expenses: Expense[], referenceDate = new Date()) => {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed
  
  let totalAllTime = 0;
  let totalThisMonth = 0;
  let totalLastMonth = 0;
  
  const categoryTotals: Partial<Record<ExpenseCategory, number>> = {};
  const paymentTotals: Partial<Record<PaymentMethod, number>> = {};

  expenses.forEach((item) => {
    totalAllTime += item.amount;
    
    // Category mapping
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    
    // Payment method mapping
    paymentTotals[item.paymentMethod] = (paymentTotals[item.paymentMethod] || 0) + item.amount;

    if (item.date) {
      const [expYear, expMonth] = item.date.split('-').map(Number);
      if (expYear === currentYear && expMonth - 1 === currentMonth) {
        totalThisMonth += item.amount;
      }
      
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      if (expYear === prevMonthYear && expMonth - 1 === prevMonth) {
        totalLastMonth += item.amount;
      }
    }
  });

  const daysPassedInMonth = Math.max(1, referenceDate.getDate());
  const dailyAverageThisMonth = totalThisMonth / daysPassedInMonth;

  // Find highest category
  let topCategory: { category: ExpenseCategory | null; amount: number } = {
    category: null,
    amount: 0,
  };

  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategory.amount) {
      topCategory = { category: cat as ExpenseCategory, amount: amt };
    }
  });

  return {
    totalAllTime,
    totalThisMonth,
    totalLastMonth,
    dailyAverageThisMonth,
    categoryTotals,
    paymentTotals,
    topCategory,
    transactionCount: expenses.length,
  };
};

export const exportExpensesToCSV = (expenses: Expense[], currencySymbol = '$'): void => {
  const headers = ['ID', 'Title', `Amount (${currencySymbol})`, 'Category', 'Date', 'Payment Method', 'Notes'];
  
  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    `"${e.category}"`,
    `"${e.date}"`,
    `"${e.paymentMethod}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expense_tracker_export_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
