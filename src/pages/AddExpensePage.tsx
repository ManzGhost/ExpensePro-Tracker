import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { ExpenseForm } from '../components/forms/ExpenseForm';

export const AddExpensePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12" id="add-expense-page-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/expenses"
            id="back-to-expenses-link"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Expenses
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <PlusCircle size={20} />
            </div>
            Record New Expense
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details below to log a new spending transaction.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-3xl border border-[#222] shadow-xs">
        <ExpenseForm />
      </div>
    </div>
  );
};
