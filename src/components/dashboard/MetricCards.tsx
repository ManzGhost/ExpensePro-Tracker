import React from 'react';
import { DollarSign, Calendar, TrendingUp, Award, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { calculateTotals, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const MetricCards: React.FC = () => {
  const { expenses, budgetConfig } = useExpenses();
  const totals = calculateTotals(expenses);

  const monthDifference = totals.totalThisMonth - totals.totalLastMonth;
  const monthPercentChange = totals.totalLastMonth > 0
    ? Math.round((monthDifference / totals.totalLastMonth) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. This Month */}
      <div
        id="metric-this-month"
        className="p-6 rounded-3xl bg-[#121212] border border-[#222] hover:border-[#333] transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Monthly Spendings
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-3xl font-bold text-white font-mono tracking-tight">
              {formatCurrency(totals.totalThisMonth, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
            </h3>
            {totals.totalLastMonth > 0 && (
              monthDifference > 0 ? (
                <span className="text-rose-400 text-xs font-mono px-1.5 py-0.5 bg-rose-400/10 rounded border border-rose-500/20 flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> +{monthPercentChange}%
                </span>
              ) : (
                <span className="text-emerald-400 text-xs font-mono px-1.5 py-0.5 bg-emerald-400/10 rounded border border-emerald-500/20 flex items-center gap-0.5">
                  <ArrowDownRight size={12} /> {monthPercentChange}%
                </span>
              )
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
            <span>Current monthly billing cycle</span>
          </p>
        </div>
      </div>

      {/* 2. Daily Average */}
      <div
        id="metric-daily-average"
        className="p-6 rounded-3xl bg-[#121212] border border-[#222] hover:border-[#333] transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Daily Average
          </span>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-3xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(totals.dailyAverageThisMonth, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
            <span>Per day this month</span>
          </p>
        </div>
      </div>

      {/* 3. Top Category */}
      <div
        id="metric-top-category"
        className="p-6 rounded-3xl bg-[#121212] border border-[#222] hover:border-[#333] transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Top Category
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform">
            {totals.topCategory.category ? (
              <CategoryIcon name={totals.topCategory.category} size={18} />
            ) : (
              <Award size={18} />
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-white truncate tracking-tight">
            {totals.topCategory.category || 'None yet'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium font-mono">
            {totals.topCategory.amount > 0 ? (
              <span className="text-purple-400 font-bold">
                {formatCurrency(totals.topCategory.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)} spent
              </span>
            ) : (
              <span>Add expenses to calculate</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
