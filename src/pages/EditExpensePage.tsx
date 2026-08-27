import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit3, ArrowLeft, AlertCircle } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { ExpenseForm } from '../components/forms/ExpenseForm';

export const EditExpensePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExpenseById } = useExpenses();

  const expense = id ? getExpenseById(id) : undefined;

  if (!expense) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4" id="edit-not-found-view">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white">Expense Not Found</h2>
        <p className="text-xs text-gray-400">
          The transaction you are attempting to edit does not exist or may have been deleted.
        </p>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Expense List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12" id="edit-expense-page-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/expenses"
            id="edit-back-to-expenses-link"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Expenses
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <Edit3 size={20} />
            </div>
            Edit Expense
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Update the transaction details, amount, category, or payment method.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-3xl border border-[#222] shadow-xs">
        <ExpenseForm initialExpense={expense} isEditMode onSuccess={() => navigate('/expenses')} />
      </div>
    </div>
  );
};
