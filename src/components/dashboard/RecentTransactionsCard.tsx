import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Edit3, Trash2, Plus } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { Expense } from '../../types';
import { CATEGORY_DETAILS } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon, PaymentIcon } from '../common/CategoryIcon';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const RecentTransactionsCard: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, budgetConfig, deleteExpense } = useExpenses();
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div
      id="recent-transactions-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Recent Activity</h3>
            <p className="text-xs text-gray-500">Latest expense entries</p>
          </div>
        </div>

        <Link
          to="/expenses"
          id="view-all-expenses-link"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View All ({expenses.length}) <ArrowRight size={14} />
        </Link>
      </div>

      {recentExpenses.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm text-gray-500">No transactions recorded yet.</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Plus size={14} /> Add First Expense
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#1f1f1f]">
          {recentExpenses.map((expense) => {
            const catDetails = CATEGORY_DETAILS[expense.category];

            return (
              <div
                key={expense.id}
                id={`recent-item-${expense.id}`}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-[#161616] px-2.5 -mx-2.5 rounded-2xl transition-colors"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      catDetails ? catDetails.lightBg + ' ' + catDetails.borderClass : 'bg-[#1a1a1a] border-[#2a2a2a]'
                    }`}
                  >
                    <CategoryIcon name={expense.category} size={18} className={catDetails?.colorText} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-100 truncate group-hover:text-indigo-400 transition-colors">
                      {expense.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <PaymentIcon method={expense.paymentMethod} size={12} />
                        {expense.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Quick Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-white font-mono">
                    -{formatCurrency(expense.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      type="button"
                      id={`edit-recent-${expense.id}`}
                      onClick={() => navigate(`/edit/${expense.id}`)}
                      className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Edit expense"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      id={`delete-recent-${expense.id}`}
                      onClick={() => setExpenseToDelete(expense)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
