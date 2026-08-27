import axios, { AxiosError } from 'axios';
import { Expense, ExpenseCategory, PaymentMethod, ExpenseFilters } from '../types';

// Spring Boot backend base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Storage token key
export const JWT_TOKEN_KEY = 'expenseflow_jwt_token';

// Attach JWT Token to every outgoing request if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized/expired tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(JWT_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// API Service definitions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      token: string;
      type: string;
      user: { id: string; name: string; email: string; createdAt: string };
    }>('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post<{
      token: string;
      type: string;
      user: { id: string; name: string; email: string; createdAt: string };
    }>('/auth/register', { name, email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<{ id: string; name: string; email: string; createdAt: string }>('/users/me');
    return response.data;
  },
};

export const expenseApi = {
  getAll: async (filters?: Partial<ExpenseFilters>) => {
    const params: Record<string, any> = {};
    if (filters?.searchQuery) params.search = filters.searchQuery;
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') params.paymentMethod = filters.paymentMethod;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.minAmount !== undefined) params.minAmount = filters.minAmount;
    if (filters?.maxAmount !== undefined) params.maxAmount = filters.maxAmount;
    if (filters?.sortBy) params.sortBy = filters.sortBy;

    const response = await apiClient.get<Expense[]>('/expenses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const response = await apiClient.post<Expense>('/expenses', {
      title: data.title,
      amount: data.amount,
      category: data.category,
      date: data.date,
      paymentMethod: data.paymentMethod,
      description: data.notes || '',
      notes: data.notes || '',
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, {
      title: data.title,
      amount: data.amount,
      category: data.category,
      date: data.date,
      paymentMethod: data.paymentMethod,
      description: data.notes,
      notes: data.notes,
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/expenses/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: string[]) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: number }>('/expenses/bulk-delete', {
      ids,
    });
    return response.data;
  },

  importExpenses: async (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    const payload = expenses.map((e) => ({
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date,
      paymentMethod: e.paymentMethod,
      description: e.notes || '',
      notes: e.notes || '',
    }));
    const response = await apiClient.post<{ success: boolean; message: string; data: Expense[] }>('/expenses/import', payload);
    return response.data;
  },

  clearAll: async () => {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/expenses/all');
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get<{
      totalExpenses: number;
      totalTransactions: number;
      averageExpense: number;
      highestExpense: number;
      mostFrequentCategory: string;
      categoryBreakdown: Record<string, number>;
      paymentMethodBreakdown: Record<string, number>;
      monthlyTrends: Record<string, number>;
    }>('/expenses/summary');
    return response.data;
  },
};
