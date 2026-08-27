import React from 'react';
import { Target, AlertTriangle, CheckCircle2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { calculateTotals, formatCurrency, getDaysInMonth } from '../../utils/formatters';

interface BudgetProgressCardProps {
  onOpenSettings?: () => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({ onOpenSettings }) => {
  const { expenses, budgetConfig } = useExpenses();
  const totals = calculateTotals(expenses);

  const now = new Date();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);

  const monthlyBudget = budgetConfig.monthlyBudget || 2500;
  const spent = totals.totalThisMonth;
  const remaining = monthlyBudget - spent;
  const percentage = Math.min(100, Math.max(0, (spent / monthlyBudget) * 100));
  const isOverBudget = spent > monthlyBudget;

  const safeDailySpend = remaining > 0 ? remaining / remainingDays : 0;

  // Progress Bar Color
  let progressColor = 'bg-gradient-to-r from-indigo-600 to-purple-600';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let statusText = 'On Track';

  if (isOverBudget) {
    progressColor = 'bg-rose-500';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    statusText = 'Over Budget!';
  } else if (percentage >= 85) {
    progressColor = 'bg-amber-500';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    statusText = 'Approaching Limit';
  }

  return (
    <div
      id="budget-progress-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Active Budget Target</h3>
            <p className="text-xs text-gray-500">
              {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${badgeColor} flex items-center gap-1`}>
            {isOverBudget ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
            {statusText}
          </span>
          {onOpenSettings && (
            <button
              type="button"
              id="budget-card-edit-btn"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
              title="Change monthly budget limit"
            >
              <SlidersHorizontal size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Budget Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
        <div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
            Spent So Far
          </span>
          <span className="text-xl font-bold text-white font-mono">
            {formatCurrency(spent, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
            Remaining Balance
          </span>
          <span
            className={`text-xl font-bold font-mono ${
              remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(remaining, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
            Total Cap
          </span>
          <span className="text-xl font-bold text-gray-400 font-mono">
            {formatCurrency(monthlyBudget, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-gray-400">
          <span>{percentage.toFixed(1)}% consumed</span>
          <span>{remainingDays} days remaining</span>
        </div>
        <div className="h-3 w-full bg-[#1f1f1f] rounded-full overflow-hidden p-0.5 border border-[#2a2a2a]">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Safe Daily Spend Tip */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#161616] border border-[#222] text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-400 shrink-0" />
          <span>
            {isOverBudget ? (
              <span className="text-rose-400 font-medium">
                Limit exceeded by {formatCurrency(Math.abs(remaining), budgetConfig.currencySymbol, budgetConfig.currencyCode)}. Try reducing non-essential spending.
              </span>
            ) : (
              <span>
                Recommended daily budget for rest of month:{' '}
                <strong className="text-white font-mono">
                  {formatCurrency(safeDailySpend, budgetConfig.currencySymbol, budgetConfig.currencyCode)}/day
                </strong>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
