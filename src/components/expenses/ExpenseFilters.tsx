import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  DollarSign,
} from 'lucide-react';
import { ExpenseFilters, ExpenseCategory, PaymentMethod, DateRangeOption, SortOption } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';
import { useExpenses } from '../../context/ExpenseContext';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  onReset: () => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const ExpenseFiltersBar: React.FC<ExpenseFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalFilteredCount,
  totalCount,
}) => {
  const { budgetConfig } = useExpenses();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.searchQuery ? 1 : 0,
    filters.category !== 'all' ? 1 : 0,
    filters.paymentMethod !== 'all' ? 1 : 0,
    filters.dateRange !== 'all' ? 1 : 0,
    filters.minAmount !== undefined ? 1 : 0,
    filters.maxAmount !== undefined ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleSearchChange = (val: string) => {
    onChange({ ...filters, searchQuery: val });
  };

  const handleCategoryChange = (val: ExpenseCategory | 'all') => {
    onChange({ ...filters, category: val });
  };

  const handlePaymentChange = (val: PaymentMethod | 'all') => {
    onChange({ ...filters, paymentMethod: val });
  };

  const handleDateRangeChange = (val: DateRangeOption) => {
    onChange({ ...filters, dateRange: val });
  };

  const handleSortChange = (val: SortOption) => {
    onChange({ ...filters, sortBy: val });
  };

  return (
    <div className="bg-[#121212] p-4 sm:p-5 rounded-3xl border border-[#222] shadow-xs space-y-3" id="expense-filters-bar">
      {/* Top Bar: Search, Category dropdown, Date quick selector, and Sort */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            id="expense-search-input"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, notes, or category..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-sm text-white placeholder-gray-500 focus:bg-[#1a1a1a] focus:border-indigo-500 focus:outline-hidden transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              id="clear-search-btn"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category & Date Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Category Dropdown */}
          <select
            id="filter-category-select"
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value as any)}
            className="px-3 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-xs font-semibold text-gray-300 hover:border-[#333] hover:text-white focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all" className="bg-[#121212] text-white">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#121212] text-white">
                {c}
              </option>
            ))}
          </select>

          {/* Date Range Dropdown */}
          <select
            id="filter-date-range-select"
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as DateRangeOption)}
            className="px-3 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-xs font-semibold text-gray-300 hover:border-[#333] hover:text-white focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all" className="bg-[#121212] text-white">All Time</option>
            <option value="this_month" className="bg-[#121212] text-white">This Month</option>
            <option value="last_month" className="bg-[#121212] text-white">Last Month</option>
            <option value="last_30_days" className="bg-[#121212] text-white">Last 30 Days</option>
            <option value="this_year" className="bg-[#121212] text-white">This Year</option>
            <option value="custom" className="bg-[#121212] text-white">Custom Range...</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            id="sort-by-select"
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-3 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-xs font-semibold text-gray-300 hover:border-[#333] hover:text-white focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="date_desc" className="bg-[#121212] text-white">Newest First</option>
            <option value="date_asc" className="bg-[#121212] text-white">Oldest First</option>
            <option value="amount_desc" className="bg-[#121212] text-white">Highest Amount</option>
            <option value="amount_asc" className="bg-[#121212] text-white">Lowest Amount</option>
            <option value="title_asc" className="bg-[#121212] text-white">Title (A-Z)</option>
          </select>

          {/* Toggle More Filters */}
          <button
            type="button"
            id="toggle-advanced-filters-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400'
                : 'border-[#262626] bg-[#161616] text-gray-300 hover:bg-[#1f1f1f] hover:text-white'
            }`}
            title="More filters"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filter Collapse */}
      {showAdvanced && (
        <div className="pt-3 border-t border-[#1f1f1f] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Payment Method
            </label>
            <select
              id="filter-payment-method-select"
              value={filters.paymentMethod}
              onChange={(e) => handlePaymentChange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#161616] text-xs font-medium text-gray-200 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="all" className="bg-[#121212] text-white">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm} className="bg-[#121212] text-white">
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Min Amount ({budgetConfig.currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              id="filter-min-amount-input"
              value={filters.minAmount ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#161616] text-xs font-mono font-medium text-white focus:border-indigo-500 focus:outline-hidden placeholder-gray-600"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Max Amount ({budgetConfig.currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              placeholder="No limit"
              id="filter-max-amount-input"
              value={filters.maxAmount ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#161616] text-xs font-mono font-medium text-white focus:border-indigo-500 focus:outline-hidden placeholder-gray-600"
            />
          </div>

          {/* Custom Date Range pickers (if dateRange === 'custom') */}
          {filters.dateRange === 'custom' && (
            <div className="col-span-1 sm:col-span-2 md:col-span-4 flex items-center gap-3 bg-[#161616] p-3 rounded-2xl border border-[#222]">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  id="filter-custom-start-date"
                  value={filters.startDate || ''}
                  onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212] text-xs font-medium text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  id="filter-custom-end-date"
                  value={filters.endDate || ''}
                  onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212] text-xs font-medium text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Status Summary & Reset */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>
          Showing <strong className="text-white font-medium">{totalFilteredCount}</strong> of{' '}
          <strong className="text-white font-medium">{totalCount}</strong> transactions
        </span>

        {activeFilterCount > 0 && (
          <button
            type="button"
            id="reset-filters-btn"
            onClick={onReset}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
          >
            <RotateCcw size={12} /> Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
