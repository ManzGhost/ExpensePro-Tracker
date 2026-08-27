import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Receipt, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { ExpenseFilters, SortOption, Expense } from '../types';
import { ExpenseFiltersBar } from '../components/expenses/ExpenseFilters';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExportImportControls } from '../components/expenses/ExportImportControls';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_FILTERS: ExpenseFilters = {
  searchQuery: '',
  category: 'all',
  paymentMethod: 'all',
  dateRange: 'all',
  sortBy: 'date_desc',
};

export const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, budgetConfig } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  // Filter and Sort logic
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 1. Search Query (matches title or notes or category)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (filters.category !== 'all') {
      result = result.filter((e) => e.category === filters.category);
    }

    // 3. Payment Method Filter
    if (filters.paymentMethod !== 'all') {
      result = result.filter((e) => e.paymentMethod === filters.paymentMethod);
    }

    // 4. Date Range Filter
    if (filters.dateRange === 'this_month') {
      result = result.filter((e) => {
        if (!e.date) return false;
        const [y, m] = e.date.split('-').map(Number);
        return y === currentYear && m - 1 === currentMonth;
      });
    } else if (filters.dateRange === 'last_month') {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      result = result.filter((e) => {
        if (!e.date) return false;
        const [y, m] = e.date.split('-').map(Number);
        return y === prevYear && m - 1 === prevMonth;
      });
    } else if (filters.dateRange === 'last_30_days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter((e) => new Date(e.date) >= thirtyDaysAgo);
    } else if (filters.dateRange === 'this_year') {
      result = result.filter((e) => {
        if (!e.date) return false;
        const [y] = e.date.split('-').map(Number);
        return y === currentYear;
      });
    } else if (filters.dateRange === 'custom') {
      if (filters.startDate) {
        result = result.filter((e) => e.date >= filters.startDate!);
      }
      if (filters.endDate) {
        result = result.filter((e) => e.date <= filters.endDate!);
      }
    }

    // 5. Min & Max Amount Filter
    if (filters.minAmount !== undefined && !isNaN(filters.minAmount)) {
      result = result.filter((e) => e.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined && !isNaN(filters.maxAmount)) {
      result = result.filter((e) => e.amount <= filters.maxAmount!);
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [expenses, filters]);

  const totalFilteredAmount = useMemo(() => {
    return filteredAndSortedExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredAndSortedExpenses]);

  return (
    <div className="space-y-6 pb-12" id="expenses-page-view">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Expense History
            </h1>
            <span className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              Total: {formatCurrency(totalFilteredAmount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Search, filter, edit, or export your complete financial records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export / Import Toolbar */}
          <ExportImportControls filteredExpenses={filteredAndSortedExpenses} />

          {/* Add New Expense Button */}
          <Link
            to="/add"
            id="expenses-page-add-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <ExpenseFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        totalFilteredCount={filteredAndSortedExpenses.length}
        totalCount={expenses.length}
      />

      {/* Expense Table / Card List */}
      <ExpenseTable
        expenses={filteredAndSortedExpenses}
        currentSort={filters.sortBy}
        onSortChange={(sort) => setFilters((prev) => ({ ...prev, sortBy: sort }))}
        onAddNew={() => navigate('/add')}
      />
    </div>
  );
};
