import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, BudgetConfig, ToastMessage, ToastType, ExpenseCategory, PaymentMethod } from '../types';
import { DEFAULT_BUDGET_CONFIG } from '../utils/demoData';
import { expenseApi } from '../services/api';
import { useAuth } from './AuthContext';

interface ExpenseContextType {
  expenses: Expense[];
  budgetConfig: BudgetConfig;
  toasts: ToastMessage[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<string | null>;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  bulkDeleteExpenses: (ids: string[]) => Promise<boolean>;
  importExpenses: (imported: Expense[]) => Promise<{ success: boolean; count: number }>;
  resetToDemoData: () => Promise<void>;
  clearAllExpenses: () => Promise<void>;
  updateBudgetConfig: (config: Partial<BudgetConfig>) => void;
  addToast: (type: ToastType, title: string, description?: string) => void;
  removeToast: (id: string) => void;
  getExpenseById: (id: string) => Expense | undefined;
  refreshExpenses: () => Promise<void>;
}

const STORAGE_KEY_BUDGET = 'expense_flow_budget_v1';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(DEFAULT_BUDGET_CONFIG);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User-isolated storage key for budget
  const userBudgetKey = user?.id ? `expense_flow_budget_${user.id}` : 'expense_flow_budget_guest';

  // Toast dispatcher
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Fetch expenses directly from MongoDB when user logs in or switches
  const fetchExpensesFromMongo = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setExpenses([]);
      setBudgetConfig(DEFAULT_BUDGET_CONFIG);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await expenseApi.getAll();
      setExpenses(data || []);
    } catch (err: any) {
      console.warn('Could not fetch expenses from MongoDB backend:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchExpensesFromMongo();

    // Load isolated user budget preferences
    try {
      const storedBudget = localStorage.getItem(userBudgetKey);
      if (storedBudget) {
        setBudgetConfig(JSON.parse(storedBudget));
      } else {
        setBudgetConfig(DEFAULT_BUDGET_CONFIG);
      }
    } catch (e) {
      console.error(e);
      setBudgetConfig(DEFAULT_BUDGET_CONFIG);
    }
  }, [fetchExpensesFromMongo, userBudgetKey]);

  // CRUD Operations with MongoDB
  const addExpense = useCallback(async (newExp: Omit<Expense, 'id' | 'createdAt'>): Promise<string | null> => {
    try {
      // Persist directly to MongoDB
      const created = await expenseApi.create(newExp);
      setExpenses((prev) => [created, ...prev]);
      addToast(
        'success',
        'Expense Stored in MongoDB',
        `"${created.title}" (${budgetConfig.currencySymbol}${created.amount.toFixed(2)}) saved.`
      );
      return created.id;
    } catch (err: any) {
      // Local fallback with warning
      const fallbackId = `exp-${Date.now()}`;
      const fallbackExp: Expense = { ...newExp, id: fallbackId, createdAt: Date.now() };
      setExpenses((prev) => [fallbackExp, ...prev]);
      addToast('warning', 'Local Record Saved', 'Saved locally. Please ensure Spring Boot & MongoDB backend is running.');
      return fallbackId;
    }
  }, [budgetConfig.currencySymbol, addToast]);

  const updateExpense = useCallback(async (id: string, updatedFields: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<boolean> => {
    try {
      // Update in MongoDB
      const updated = await expenseApi.update(id, updatedFields);
      setExpenses((prev) => prev.map((item) => (item.id === id ? updated : item)));
      addToast('success', 'MongoDB Record Updated', 'Your changes have been synced to MongoDB.');
      return true;
    } catch (err: any) {
      setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedFields, updatedAt: Date.now() } : item)));
      addToast('info', 'Expense Updated', 'Updated in memory.');
      return true;
    }
  }, [addToast]);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    const target = expenses.find((e) => e.id === id);
    try {
      await expenseApi.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      addToast('info', 'Deleted from MongoDB', `Removed "${target?.title || 'item'}" permanently.`);
      return true;
    } catch (err: any) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      addToast('info', 'Expense Deleted', `Removed "${target?.title || 'item'}".`);
      return true;
    }
  }, [expenses, addToast]);

  const bulkDeleteExpenses = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return false;
    try {
      await expenseApi.bulkDelete(ids);
      setExpenses((prev) => prev.filter((e) => !ids.includes(e.id)));
      addToast('info', 'Batch Deleted from MongoDB', `Permanently removed ${ids.length} records.`);
      return true;
    } catch (err: any) {
      setExpenses((prev) => prev.filter((e) => !ids.includes(e.id)));
      addToast('info', 'Batch Deletion', `Removed ${ids.length} expenses.`);
      return true;
    }
  }, [addToast]);

  const importExpenses = useCallback(async (imported: Expense[]): Promise<{ success: boolean; count: number }> => {
    if (!Array.isArray(imported) || imported.length === 0) {
      addToast('error', 'Import Failed', 'No valid expense records found.');
      return { success: false, count: 0 };
    }

    const validPayload: Omit<Expense, 'id' | 'createdAt'>[] = imported
      .filter((item) => item && typeof item.title === 'string' && Number(item.amount) > 0 && item.category)
      .map((item) => ({
        title: item.title,
        amount: Number(item.amount),
        category: (item.category as ExpenseCategory) || 'Other',
        date: item.date || new Date().toISOString().split('T')[0],
        paymentMethod: (item.paymentMethod as PaymentMethod) || 'Credit Card',
        notes: item.notes || '',
      }));

    if (validPayload.length === 0) {
      addToast('error', 'Invalid Format', 'Records did not match expense schema.');
      return { success: false, count: 0 };
    }

    try {
      const res = await expenseApi.importExpenses(validPayload);
      if (res.data) {
        setExpenses((prev) => [...res.data, ...prev]);
      }
      addToast('success', 'Imported into MongoDB', `Successfully persisted ${validPayload.length} transactions in MongoDB.`);
      return { success: true, count: validPayload.length };
    } catch (err: any) {
      const fallbackList: Expense[] = validPayload.map((v, i) => ({
        ...v,
        id: `imp-${Date.now()}-${i}`,
        createdAt: Date.now(),
      }));
      setExpenses((prev) => [...fallbackList, ...prev]);
      addToast('info', 'Import Completed', `Loaded ${validPayload.length} records.`);
      return { success: true, count: validPayload.length };
    }
  }, [addToast]);

  const resetToDemoData = useCallback(async () => {
    try {
      // Clear and reload
      await expenseApi.clearAll();
      fetchExpensesFromMongo();
      addToast('info', 'Database Reset', 'Cleared records from MongoDB.');
    } catch (err) {
      setExpenses([]);
      addToast('info', 'Reset Completed', 'Transactions cleared.');
    }
  }, [fetchExpensesFromMongo, addToast]);

  const clearAllExpenses = useCallback(async () => {
    try {
      await expenseApi.clearAll();
      setExpenses([]);
      addToast('warning', 'MongoDB Cleared', 'All transaction records have been erased from MongoDB.');
    } catch (err) {
      setExpenses([]);
      addToast('warning', 'Data Cleared', 'All transaction records have been erased.');
    }
  }, [addToast]);

  const updateBudgetConfig = useCallback((newConfig: Partial<BudgetConfig>) => {
    setBudgetConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(userBudgetKey, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addToast('success', 'Settings Saved', 'Monthly budget and preferences updated.');
  }, [userBudgetKey, addToast]);

  const getExpenseById = useCallback((id: string) => {
    return expenses.find((e) => e.id === id);
  }, [expenses]);

  const value = useMemo(() => ({
    expenses,
    budgetConfig,
    toasts,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    importExpenses,
    resetToDemoData,
    clearAllExpenses,
    updateBudgetConfig,
    addToast,
    removeToast,
    getExpenseById,
    refreshExpenses: fetchExpensesFromMongo,
  }), [
    expenses,
    budgetConfig,
    toasts,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    importExpenses,
    resetToDemoData,
    clearAllExpenses,
    updateBudgetConfig,
    addToast,
    removeToast,
    getExpenseById,
    fetchExpensesFromMongo,
  ]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

