import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, DollarSign, Check, RotateCcw, UserX, AlertTriangle, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENCY_OPTIONS, EXPENSE_CATEGORIES } from '../../constants/categories';
import { ExpenseCategory } from '../../types';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { budgetConfig, updateBudgetConfig, resetToDemoData, clearAllExpenses, addToast } = useExpenses();
  const { user, isAuthenticated, deleteAccount } = useAuth();

  const [monthlyBudget, setMonthlyBudget] = useState<string>(budgetConfig.monthlyBudget.toString());
  const [selectedCurrency, setSelectedCurrency] = useState(budgetConfig.currencyCode);
  const [categoryBudgets, setCategoryBudgets] = useState<Partial<Record<ExpenseCategory, number>>>(
    budgetConfig.categoryBudgets || {}
  );
  const [activeTab, setActiveTab] = useState<'budget' | 'data' | 'account'>('budget');
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState<string>('');
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>('');
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setMonthlyBudget(budgetConfig.monthlyBudget.toString());
      setSelectedCurrency(budgetConfig.currencyCode);
      setCategoryBudgets(budgetConfig.categoryBudgets || {});
      setIsConfirmingClear(false);
      setIsConfirmingDelete(false);
      setConfirmDeleteText('');
      setDeleteErrorMessage('');
      setIsDeletingAccount(false);
      setIsDeleteAccountModalOpen(false);
    }
  }, [isOpen, budgetConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = CURRENCY_OPTIONS.find((c) => c.code === selectedCurrency) || CURRENCY_OPTIONS[0];
    const budgetNum = Math.max(10, parseFloat(monthlyBudget) || 1000);

    updateBudgetConfig({
      monthlyBudget: budgetNum,
      currencyCode: curr.code,
      currencySymbol: curr.symbol,
      categoryBudgets,
    });
    onClose();
  };

  const handleCategoryBudgetChange = (cat: ExpenseCategory, val: string) => {
    const num = parseFloat(val);
    setCategoryBudgets((prev) => ({
      ...prev,
      [cat]: isNaN(num) || num < 0 ? undefined : num,
    }));
  };

  const handleDeleteAccountDirectly = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    setDeleteErrorMessage('');

    try {
      await clearAllExpenses();
      const res = await deleteAccount();
      if (!res.success) {
        setDeleteErrorMessage(res.error || 'Failed to delete account. Please try again.');
        setIsDeletingAccount(false);
        return;
      }

      addToast('info', 'Account Deleted', 'Your account and expense data have been permanently removed.');
      onClose();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setDeleteErrorMessage(err.message || 'An unexpected error occurred during account deletion.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Budget & Preferences"
      subtitle="Configure your financial limits, currency, and data options."
      maxWidth="lg"
      id="budget-settings-modal"
    >
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex border-b border-[#1f1f1f]">
          <button
            type="button"
            id="tab-btn-budget"
            onClick={() => setActiveTab('budget')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'budget'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Budget Limits & Currency
          </button>
          <button
            type="button"
            id="tab-btn-data"
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Data Management
          </button>
          {isAuthenticated && (
            <button
              type="button"
              id="tab-btn-account"
              onClick={() => setActiveTab('account')}
              className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Account & Security
            </button>
          )}
        </div>

        {activeTab === 'budget' ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Monthly Budget Input */}
            <div>
              <label htmlFor="monthly-budget-input" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Monthly Spending Limit
              </label>
              <div className="relative rounded-2xl border border-[#262626] focus-within:border-indigo-500 transition-all bg-[#161616] overflow-hidden">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-base">
                  {budgetConfig.currencySymbol}
                </span>
                <input
                  id="monthly-budget-input"
                  type="number"
                  step="10"
                  min="1"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-base font-bold text-white bg-transparent focus:outline-hidden"
                  placeholder="e.g. 2500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used to calculate monthly progress bars, remaining allowances, and overspending warnings.
              </p>
            </div>

            {/* Currency Selector */}
            <div>
              <label htmlFor="currency-select" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Preferred Currency
              </label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-white text-sm font-medium focus:border-indigo-500 focus:outline-hidden"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#121212] text-white">
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Budgets Accordion / Section */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Optional Category Targets
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-[#222] rounded-2xl p-3 bg-[#161616]/60">
                {EXPENSE_CATEGORIES.slice(0, 6).map((cat) => (
                  <div key={cat} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-gray-300 truncate">{cat}</span>
                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                        {budgetConfig.currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        placeholder="No limit"
                        value={categoryBudgets[cat] || ''}
                        onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212] text-right text-white font-medium focus:border-indigo-500 focus:outline-hidden"
                        id={`category-budget-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f1f]">
              <button
                type="button"
                id="cancel-budget-btn"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#1f1f1f] hover:text-white font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-budget-btn"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
              >
                <Check size={16} />
                Save Settings
              </button>
            </div>
          </form>
        ) : activeTab === 'data' ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#161616] border border-[#222] rounded-2xl space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white">Reset Demo Transactions</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Populates the tracker with 16 realistic multi-category transactions and resets default budgets.
                </p>
              </div>
              <button
                type="button"
                id="reset-demo-data-btn"
                onClick={() => {
                  resetToDemoData();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-white font-medium text-xs flex items-center gap-2 transition-colors border border-[#333]"
              >
                <RotateCcw size={14} />
                Load Demo Transactions
              </button>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-3">
              <div>
                <h4 className="text-sm font-bold text-rose-200">Clear All Transactions</h4>
                <p className="text-xs text-rose-400/80 mt-0.5">
                  Permanently erase all stored records from the database for a fresh start.
                </p>
              </div>

              {isConfirmingClear ? (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-2.5">
                  <p className="text-xs font-semibold text-rose-200">
                    Are you sure? This will permanently delete all expenses and cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="clear-all-data-btn"
                      onClick={() => {
                        clearAllExpenses();
                        setIsConfirmingClear(false);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm shadow-rose-900/40"
                    >
                      Yes, Delete All Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClear(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-gray-300 hover:text-white font-medium text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="clear-all-data-btn"
                  onClick={() => setIsConfirmingClear(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-lg shadow-rose-900/30"
                >
                  Clear All Data
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Account Info Card */}
            <div className="p-4 bg-[#161616] border border-[#222] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{user?.name || 'Registered User'}</h4>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Active Account
                </span>
              </div>
            </div>

            {/* Danger Zone: Permanent Account Deletion */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-200">Permanent Account Deletion</h4>
                  <p className="text-xs text-rose-300/80 leading-relaxed">
                    Permanently delete your user account (<strong className="text-rose-200">{user?.email}</strong>) and erase all your personal expenses, categories, and records from the database.
                  </p>
                </div>
              </div>

              {deleteErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
                  {deleteErrorMessage}
                </div>
              )}

              {isConfirmingDelete ? (
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-3">
                  <div>
                    <label htmlFor="settings-confirm-delete-input" className="block text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">
                      Type <span className="text-white font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">DELETE</span> to confirm
                    </label>
                    <input
                      id="settings-confirm-delete-input"
                      type="text"
                      value={confirmDeleteText}
                      onChange={(e) => setConfirmDeleteText(e.target.value)}
                      disabled={isDeletingAccount}
                      placeholder="Type DELETE"
                      className="w-full px-3 py-2 rounded-xl border border-rose-500/50 bg-[#121212] text-white font-mono text-xs focus:border-rose-400 focus:outline-hidden"
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="settings-delete-account-btn"
                      onClick={handleDeleteAccountDirectly}
                      disabled={confirmDeleteText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:text-rose-400/40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Deleting Account...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          <span>Confirm & Delete Account</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConfirmingDelete(false);
                        setConfirmDeleteText('');
                        setDeleteErrorMessage('');
                      }}
                      disabled={isDeletingAccount}
                      className="px-3.5 py-2 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-gray-300 hover:text-white font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    type="button"
                    id="settings-delete-account-btn"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
                  >
                    <UserX size={15} />
                    <span>Permanently Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Account Deletion Confirmation Dialog */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </Modal>
  );
};
