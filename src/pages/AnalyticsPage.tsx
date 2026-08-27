import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Plus, ArrowRight } from 'lucide-react';
import { MonthlyTrendsChart } from '../components/analytics/MonthlyTrendsChart';
import { CategoryBreakdownCard } from '../components/dashboard/CategoryBreakdownCard';
import { PaymentMethodChart } from '../components/analytics/PaymentMethodChart';
import { DayOfWeekHeatmap } from '../components/analytics/DayOfWeekHeatmap';
import { TopExpensesList } from '../components/analytics/TopExpensesList';
import { MetricCards } from '../components/dashboard/MetricCards';
import { useExpenses } from '../context/ExpenseContext';

export const AnalyticsPage: React.FC = () => {
  const { expenses } = useExpenses();

  return (
    <div className="space-y-6 pb-12" id="analytics-page-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Spending Analytics & Insights
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Visualize your expenses, analyze monthly trends, and discover spending patterns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/add"
            id="analytics-add-expense-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricCards />

      {/* Monthly Trends Bar Chart */}
      <MonthlyTrendsChart />

      {/* Category Breakdown & Payment Methods 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CategoryBreakdownCard />
        </div>
        <div className="lg:col-span-5">
          <PaymentMethodChart />
        </div>
      </div>

      {/* Weekly Heatmap & Top Spends 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <DayOfWeekHeatmap />
        </div>
        <div className="lg:col-span-5">
          <TopExpensesList />
        </div>
      </div>
    </div>
  );
};
