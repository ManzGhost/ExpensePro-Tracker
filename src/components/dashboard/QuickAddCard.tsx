import React, { useState, useEffect } from 'react';
import { Zap, Plus, Check, Edit2, RotateCcw, X, Save, Settings2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { QUICK_PRESETS as DEFAULT_QUICK_PRESETS, EXPENSE_CATEGORIES, PAYMENT_METHODS, QuickPreset } from '../../constants/categories';
import { getTodayDateString, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const QuickAddCard: React.FC = () => {
  const { user } = useAuth();
  const { addExpense, budgetConfig } = useExpenses();
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [presets, setPresets] = useState<QuickPreset[]>(DEFAULT_QUICK_PRESETS);
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
  const [editingPreset, setEditingPreset] = useState<QuickPreset | null>(null);

  const userPresetsKey = user?.id ? `expenseflow_custom_presets_${user.id}` : 'expenseflow_custom_presets_guest';

  // Load custom presets if saved for this specific user
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userPresetsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPresets(parsed);
          return;
        }
      }
      setPresets(DEFAULT_QUICK_PRESETS);
    } catch (e) {
      console.error('Failed to load custom presets', e);
      setPresets(DEFAULT_QUICK_PRESETS);
    }
  }, [userPresetsKey]);

  const savePresets = (newPresets: QuickPreset[]) => {
    setPresets(newPresets);
    try {
      localStorage.setItem(userPresetsKey, JSON.stringify(newPresets));
    } catch (e) {
      console.error('Failed to save presets', e);
    }
  };

  const handleQuickAdd = (preset: QuickPreset) => {
    if (isEditingMode) {
      setEditingPreset(preset);
      return;
    }

    addExpense({
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      date: getTodayDateString(),
      paymentMethod: preset.paymentMethod,
      notes: `Quick logged on ${new Date().toLocaleDateString()}`,
    });

    setJustAddedId(preset.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleSaveEditedPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreset) return;

    const updated = presets.map((p) => (p.id === editingPreset.id ? editingPreset : p));
    savePresets(updated);
    setEditingPreset(null);
  };

  const handleResetDefaults = () => {
    savePresets(DEFAULT_QUICK_PRESETS);
    localStorage.removeItem(userPresetsKey);
  };

  return (
    <div
      id="quick-add-presets-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white leading-tight">1-Tap Quick Log</h3>
              {isEditingMode && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Edit Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isEditingMode
                ? 'Click any preset button below to customize its title, amount, or category'
                : 'Record common daily expenses instantly with a single tap'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditingMode && (
            <button
              type="button"
              id="reset-presets-btn"
              onClick={handleResetDefaults}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] transition-colors flex items-center gap-1.5"
              title="Reset presets back to default"
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>
          )}

          <button
            type="button"
            id="toggle-edit-presets-btn"
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isEditingMode
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#222] border border-[#2a2a2a]'
            }`}
          >
            {isEditingMode ? (
              <>
                <Check size={14} />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Edit2 size={13} />
                <span>Customize Presets</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {presets.map((preset) => {
          const isAdded = justAddedId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              id={`quick-preset-btn-${preset.id}`}
              onClick={() => handleQuickAdd(preset)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                isEditingMode
                  ? 'bg-[#181818] border-amber-500/40 hover:bg-[#202020] hover:border-amber-400 hover:scale-[1.02] cursor-pointer'
                  : isAdded
                  ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500'
                  : 'bg-[#161616] border-[#222] hover:bg-[#1a1a1a] hover:border-indigo-500/40'
              }`}
            >
              {isEditingMode && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Edit2 size={11} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : isEditingMode
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-[#222] text-gray-300 group-hover:bg-indigo-600/20 group-hover:text-indigo-400'
                  }`}
                >
                  {isAdded ? <Check size={14} /> : <CategoryIcon name={preset.category} size={14} />}
                </div>
                {!isEditingMode && (
                  <span className="text-xs font-bold text-white font-mono">
                    {formatCurrency(preset.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                  </span>
                )}
                {isEditingMode && (
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {formatCurrency(preset.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className={`text-xs font-bold truncate ${isEditingMode ? 'text-amber-200' : 'text-gray-200 group-hover:text-indigo-400'}`}>
                  {preset.title}
                </p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {isEditingMode ? 'Tap to edit' : isAdded ? 'Added just now!' : preset.category}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preset Edit Modal Dialog */}
      {editingPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            id="preset-edit-modal"
            className="w-full max-w-md bg-[#161616] border border-[#2e2e2e] rounded-3xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#282828] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Edit Quick Preset</h4>
                  <p className="text-xs text-gray-400">Configure instant 1-tap logging button</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPreset(null)}
                className="w-8 h-8 rounded-full bg-[#222] hover:bg-[#2c2c2c] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPreset} className="space-y-4">
              {/* Preset Title */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Preset Name</label>
                <input
                  type="text"
                  required
                  value={editingPreset.title}
                  onChange={(e) => setEditingPreset({ ...editingPreset, title: e.target.value })}
                  placeholder="e.g. Morning Coffee, Uber Ride"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Amount ({budgetConfig.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={editingPreset.amount || ''}
                  onChange={(e) => setEditingPreset({ ...editingPreset, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  value={editingPreset.category}
                  onChange={(e) => setEditingPreset({ ...editingPreset, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Default Payment Method</label>
                <select
                  value={editingPreset.paymentMethod}
                  onChange={(e) => setEditingPreset({ ...editingPreset, paymentMethod: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setEditingPreset(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#1f1f1f] hover:bg-[#282828] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Save size={14} />
                  <span>Save Preset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

