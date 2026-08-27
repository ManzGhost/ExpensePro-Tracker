import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8080/api';
const JWT_TOKEN_KEY = 'expenseflow_jwt_token';

// Create dedicated axios instance with automatic JWT header attachment
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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

export const expenseService = {
  // Fetch all expenses for current authenticated user from MongoDB
  getExpenses: async (params = {}) => {
    const response = await apiClient.get('/expenses', { params });
    return response.data;
  },

  // Save new expense to MongoDB linked to authenticated user
  addExpense: async (expenseData) => {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  },

  // Update existing expense in MongoDB
  updateExpense: async (id, expenseData) => {
    const response = await apiClient.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete specific expense by ID for current user
  deleteExpense: async (id) => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get aggregation summary metrics
  getSummary: async () => {
    const response = await apiClient.get('/expenses/summary');
    return response.data;
  },
};

export default expenseService;
