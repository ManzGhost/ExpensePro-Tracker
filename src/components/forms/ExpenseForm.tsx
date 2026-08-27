import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
  Plus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, CATEGORY_DETAILS } from '../../constants/categories';
import { getTodayDateString } from '../../utils/formatters';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon, PaymentIcon } from '../common/CategoryIcon';

interface ExpenseFormProps {
  initialExpense?: Expense;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

const COMMON_TAGS = [
  'Coffee',
  'Lunch',
  'Dinner',
  'Groceries',
  'Uber',
  'Fuel',
  'Gym',
  'Netflix',
  'Medicine',
  'Electricity',
  'Amazon',
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  isEditMode = false,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { addExpense, updateExpense, budgetConfig } = useExpenses();

  const [title, setTitle] = useState(initialExpense?.title || '');
  const [amount, setAmount] = useState<string>(initialExpense?.amount ? initialExpense.amount.toString() : '');
  const [category, setCategory] = useState<ExpenseCategory>(initialExpense?.category || 'Food & Dining');
  const [date, setDate] = useState(initialExpense?.date || getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialExpense?.paymentMethod || 'Credit Card');
  const [notes, setNotes] = useState(initialExpense?.notes || '');

  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    date?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setPaymentMethod(initialExpense.paymentMethod);
      setNotes(initialExpense.notes || '');
    }
  }, [initialExpense]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Expense title or description is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters long';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    } else if (numAmount > 1000000) {
      newErrors.amount = 'Amount cannot exceed 1,000,000';
    }

    if (!date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const expensePayload = {
      title: title.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category,
      date,
      paymentMethod,
      notes: notes.trim(),
    };

    try {
      if (isEditMode && initialExpense) {
        await updateExpense(initialExpense.id, expensePayload);
      } else {
        await addExpense(expensePayload);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/expenses');
      }
    } catch (err) {
      console.error('Failed to submit expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAmountIncrement = (inc: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + inc).toFixed(2));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="expense-form">
      {/* 1. Title & Quick Tags */}
      <div className="space-y-2">
        <label htmlFor="expense-title-input" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
          Expense Title <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="expense-title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. Grocery shopping, Starbucks coffee, Metro pass..."
            className={`w-full px-4 py-3 rounded-2xl border bg-[#161616] text-white font-medium placeholder-gray-500 focus:outline-hidden transition-all ${
              errors.title
                ? 'border-rose-500/80 focus:border-rose-500'
                : 'border-[#262626] focus:border-indigo-500 focus:bg-[#1a1a1a]'
            }`}
            autoFocus={!isEditMode}
          />
        </div>
        {errors.title && (
          <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle size={13} /> {errors.title}
          </p>
        )}

        {/* Quick Tag Suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" /> Quick tags:
          </span>
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              id={`quick-tag-${tag.toLowerCase()}`}
              onClick={() => {
                setTitle(tag);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className="text-xs px-2.5 py-1 rounded-xl bg-[#161616] hover:bg-indigo-600/10 hover:text-indigo-400 text-gray-400 transition-colors border border-[#262626]"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Amount & Quick Increment Pills */}
      <div className="space-y-2">
        <label htmlFor="expense-amount-input" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
          Amount ({budgetConfig.currencySymbol}) <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-2xl border border-[#262626] focus-within:border-indigo-500 bg-[#161616] overflow-hidden transition-all">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">
            {budgetConfig.currencySymbol}
          </div>
          <input
            id="expense-amount-input"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-3.5 text-2xl font-bold text-white font-mono bg-transparent focus:outline-hidden placeholder-gray-600"
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle size={13} /> {errors.amount}
          </p>
        )}

        {/* Quick Amount Add Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-gray-500">Add:</span>
          {[5, 10, 20, 50, 100].map((inc) => (
            <button
              key={inc}
              type="button"
              id={`quick-amount-add-${inc}`}
              onClick={() => handleAddAmountIncrement(inc)}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-[#161616] hover:bg-[#202020] text-gray-300 transition-colors border border-[#262626]"
            >
              +{budgetConfig.currencySymbol}{inc}
            </button>
          ))}
          {amount && (
            <button
              type="button"
              onClick={() => setAmount('')}
              className="text-xs text-gray-500 hover:text-gray-300 underline ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Visual Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
          Category <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            const details = CATEGORY_DETAILS[cat];

            return (
              <button
                key={cat}
                type="button"
                id={`cat-select-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? `${details.lightBg} ${details.borderClass} ring-1 ring-indigo-500 shadow-xs font-bold text-white`
                    : 'bg-[#161616] border-[#262626] hover:border-[#333] hover:bg-[#1c1c1c] text-gray-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? details.colorBg + ' text-white' : 'bg-[#222] text-gray-400'
                  }`}
                >
                  <CategoryIcon name={cat} size={15} />
                </div>
                <span className="text-xs truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Date & Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date input */}
        <div className="space-y-1.5">
          <label htmlFor="expense-date-input" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="expense-date-input"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-white text-sm font-medium focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          {errors.date && (
            <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
              <AlertCircle size={13} /> {errors.date}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label htmlFor="payment-method-select" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Payment Method <span className="text-rose-500">*</span>
          </label>
          <select
            id="payment-method-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-4 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-white text-sm font-medium focus:border-indigo-500 focus:outline-hidden"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm} className="bg-[#121212] text-white">
                {pm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Notes / Memo */}
      <div className="space-y-1.5">
        <label htmlFor="expense-notes-input" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
          Notes & Description <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <textarea
          id="expense-notes-input"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add details, receipt notes, location, or who you were with..."
          className="w-full px-4 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-white text-sm placeholder-gray-500 focus:border-indigo-500 focus:bg-[#1a1a1a] focus:outline-hidden transition-all"
        />
      </div>

      {/* 6. Form Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f]">
        <button
          type="button"
          id="expense-form-cancel-btn"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#262626] text-gray-300 hover:text-white hover:bg-[#1c1c1c] font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Cancel
        </button>

        <button
          type="submit"
          id="expense-form-submit-btn"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
        >
          <Check size={18} />
          {isEditMode ? 'Update Expense' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
};
