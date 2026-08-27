import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  FileText,
  CheckSquare,
  Square,
  AlertCircle,
  Inbox,
  Plus,
} from 'lucide-react';
import { Expense, SortOption } from '../../types';
import { CATEGORY_DETAILS } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon, PaymentIcon } from '../common/CategoryIcon';
import { useExpenses } from '../../context/ExpenseContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface ExpenseTableProps {
  expenses: Expense[];
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onAddNew: () => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  currentSort,
  onSortChange,
  onAddNew,
}) => {
  const navigate = useNavigate();
  const { budgetConfig, deleteExpense, bulkDeleteExpenses } = useExpenses();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected expenses?`)) {
      bulkDeleteExpenses(selectedIds);
      setSelectedIds([]);
    }
  };

  const toggleSort = (field: 'date' | 'amount' | 'title') => {
    if (field === 'date') {
      onSortChange(currentSort === 'date_desc' ? 'date_asc' : 'date_desc');
    } else if (field === 'amount') {
      onSortChange(currentSort === 'amount_desc' ? 'amount_asc' : 'amount_desc');
    } else if (field === 'title') {
      onSortChange(currentSort === 'title_asc' ? 'title_desc' : 'title_asc');
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-[#121212] rounded-3xl border border-[#222] p-12 text-center space-y-4 shadow-xs" id="expenses-empty-state">
        <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#262626] text-gray-500 flex items-center justify-center mx-auto">
          <Inbox size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">No matching expenses found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search criteria or date filters, or record a new expense.
          </p>
        </div>
        <button
          type="button"
          id="empty-state-add-btn"
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
        >
          <Plus size={14} /> Add New Expense
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] rounded-3xl border border-[#222] shadow-xs overflow-hidden" id="expense-table-container">
      {/* Batch Actions Bar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-6 py-2.5 flex items-center justify-between transition-all">
          <span className="text-xs font-bold text-indigo-300">
            {selectedIds.length} of {expenses.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="bulk-delete-btn"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Trash2 size={13} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-left border-collapse" id="expenses-table">
          <thead>
            <tr className="border-b border-[#1f1f1f] bg-[#0d0d0d] text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="py-3.5 pl-6 pr-3 w-10">
                <input
                  type="checkbox"
                  id="select-all-expenses-checkbox"
                  checked={selectedIds.length === expenses.length && expenses.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded-sm border-gray-700 bg-black/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>

              <th className="py-3.5 px-3">
                <button
                  type="button"
                  id="sort-date-col-btn"
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1 hover:text-white font-bold uppercase text-[11px] transition-colors"
                >
                  Date
                  {currentSort === 'date_desc' && <ArrowDown size={13} className="text-indigo-400" />}
                  {currentSort === 'date_asc' && <ArrowUp size={13} className="text-indigo-400" />}
                  {currentSort !== 'date_desc' && currentSort !== 'date_asc' && <ArrowUpDown size={12} className="text-gray-600" />}
                </button>
              </th>

              <th className="py-3.5 px-3">
                <button
                  type="button"
                  id="sort-title-col-btn"
                  onClick={() => toggleSort('title')}
                  className="flex items-center gap-1 hover:text-white font-bold uppercase text-[11px] transition-colors"
                >
                  Expense & Description
                  {currentSort === 'title_asc' && <ArrowDown size={13} className="text-indigo-400" />}
                  {currentSort === 'title_desc' && <ArrowUp size={13} className="text-indigo-400" />}
                </button>
              </th>

              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Payment</th>

              <th className="py-3.5 px-3 text-right">
                <button
                  type="button"
                  id="sort-amount-col-btn"
                  onClick={() => toggleSort('amount')}
                  className="inline-flex items-center gap-1 hover:text-white font-bold uppercase text-[11px] ml-auto transition-colors"
                >
                  Amount
                  {currentSort === 'amount_desc' && <ArrowDown size={13} className="text-indigo-400" />}
                  {currentSort === 'amount_asc' && <ArrowUp size={13} className="text-indigo-400" />}
                  {currentSort !== 'amount_desc' && currentSort !== 'amount_asc' && <ArrowUpDown size={12} className="text-gray-600" />}
                </button>
              </th>

              <th className="py-3.5 pl-3 pr-6 text-right w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1f1f1f] text-sm">
            {expenses.map((expense) => {
              const isSelected = selectedIds.includes(expense.id);
              const catDetails = CATEGORY_DETAILS[expense.category];

              return (
                <tr
                  key={expense.id}
                  id={`expense-row-${expense.id}`}
                  className={`hover:bg-[#161616] transition-colors group ${
                    isSelected ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 pl-6 pr-3">
                    <input
                      type="checkbox"
                      id={`select-expense-${expense.id}`}
                      checked={isSelected}
                      onChange={() => toggleSelectOne(expense.id)}
                      className="rounded-sm border-gray-700 bg-black/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-xs text-gray-400 font-medium">
                    {formatDate(expense.date)}
                  </td>

                  {/* Title & Notes */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {expense.title}
                      </span>
                      {expense.notes && (
                        <span className="text-xs text-gray-500 truncate max-w-xs mt-0.5 italic">
                          {expense.notes}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category Pill */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                        catDetails ? catDetails.lightBg + ' ' + catDetails.colorText + ' ' + catDetails.borderClass : 'bg-[#1a1a1a] text-gray-300 border-[#262626]'
                      }`}
                    >
                      <CategoryIcon name={expense.category} size={13} />
                      {expense.category}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <PaymentIcon method={expense.paymentMethod} size={14} className="text-gray-500" />
                      {expense.paymentMethod}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <span className="font-bold text-white font-mono text-sm">
                      -{formatCurrency(expense.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        id={`edit-table-btn-${expense.id}`}
                        onClick={() => navigate(`/edit/${expense.id}`)}
                        className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        id={`delete-table-btn-${expense.id}`}
                        onClick={() => setExpenseToDelete(expense)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="divide-y divide-[#1f1f1f] sm:hidden">
        {expenses.map((expense) => {
          const isSelected = selectedIds.includes(expense.id);
          const catDetails = CATEGORY_DETAILS[expense.category];

          return (
            <div
              key={expense.id}
              id={`mobile-expense-item-${expense.id}`}
              className={`p-4 space-y-3 ${isSelected ? 'bg-indigo-950/20' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(expense.id)}
                    className="rounded-sm border-gray-700 bg-black/40 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      catDetails ? catDetails.lightBg + ' ' + catDetails.borderClass : 'bg-[#1a1a1a] border-[#262626]'
                    }`}
                  >
                    <CategoryIcon name={expense.category} size={16} className={catDetails?.colorText} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{expense.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                  </div>
                </div>

                <span className="font-bold text-white font-mono text-base shrink-0">
                  -{formatCurrency(expense.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                </span>
              </div>

              {expense.notes && (
                <p className="text-xs text-gray-400 bg-[#161616] p-2 rounded-xl border border-[#222] italic">
                  {expense.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#1f1f1f]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-400 bg-[#161616] border border-[#262626] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <PaymentIcon method={expense.paymentMethod} size={11} />
                    {expense.paymentMethod}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                    {expense.category}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/edit/${expense.id}`)}
                    className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseToDelete(expense)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        expense={expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
      />
    </div>
  );
};
