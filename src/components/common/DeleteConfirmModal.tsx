import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useExpenses } from '../../context/ExpenseContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  expense,
  onConfirm,
}) => {
  const { budgetConfig } = useExpenses();

  if (!expense) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Expense"
      subtitle="This action cannot be undone."
      maxWidth="md"
      id="delete-confirm-modal"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300">
          <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-rose-200">Are you sure you want to delete this expense?</p>
            <p className="text-xs text-rose-400/80 mt-0.5">
              It will be permanently removed from your history and budget calculations.
            </p>
          </div>
        </div>

        {/* Expense Summary Card */}
        <div className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-white text-base">{expense.title}</p>
              <p className="text-xs text-gray-400">{expense.category} • {formatDate(expense.date)}</p>
            </div>
            <span className="text-lg font-bold text-rose-400 font-mono">
              {formatCurrency(expense.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
            </span>
          </div>
          {expense.notes && (
            <p className="text-xs text-gray-400 italic bg-[#1f1f1f] p-2 rounded-xl border border-[#2a2a2a]">
              &ldquo;{expense.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f1f]">
          <button
            type="button"
            id="cancel-delete-btn"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#1f1f1f] hover:text-white font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-colors"
          >
            <Trash2 size={16} />
            Delete Expense
          </button>
        </div>
      </div>
    </Modal>
  );
};
