import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sliders, ArrowRight, Download, Receipt } from 'lucide-react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { BudgetProgressCard } from '../components/dashboard/BudgetProgressCard';
import { CategoryBreakdownCard } from '../components/dashboard/CategoryBreakdownCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { QuickAddCard } from '../components/dashboard/QuickAddCard';
import { BudgetSettingsModal } from '../components/layout/BudgetSettingsModal';
import { useExpenses } from '../context/ExpenseContext';

export const DashboardPage: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { expenses } = useExpenses();

  return (
    <div className="space-y-6 pb-12" id="dashboard-page-view">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Monitor expenses, track budget utilization, and explore spending patterns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="dashboard-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161616] border border-[#262626] text-gray-300 hover:text-white hover:bg-[#1f1f1f] font-semibold text-xs transition-colors"
          >
            <Sliders size={15} />
            <span>Budget Settings</span>
          </button>

          <Link
            to="/add"
            id="dashboard-add-expense-cta"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <MetricCards />

      {/* 1-Tap Quick Presets */}
      <QuickAddCard />

      {/* Main 2-Column Grid: Budget Progress & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <BudgetProgressCard onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
        <div className="lg:col-span-6">
          <CategoryBreakdownCard />
        </div>
      </div>

      {/* Recent Activity List */}
      <RecentTransactionsCard />

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
