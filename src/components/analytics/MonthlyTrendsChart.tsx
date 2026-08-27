import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export const MonthlyTrendsChart: React.FC = () => {
  const { expenses, budgetConfig } = useExpenses();

  // Aggregate monthly data for last 6 months
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { label: string; amount: number; count: number; sortKey: string }> = {};

    const now = new Date();
    // Initialize past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${getMonthName(month)} ${String(year).slice(2)}`;
      monthsMap[sortKey] = { label, amount: 0, count: 0, sortKey };
    }

    expenses.forEach((item) => {
      if (item.date) {
        const [year, month] = item.date.split('-');
        const sortKey = `${year}-${month}`;
        if (monthsMap[sortKey]) {
          monthsMap[sortKey].amount += item.amount;
          monthsMap[sortKey].count += 1;
        } else {
          // If older or future, still include if valid
          const d = new Date(Number(year), Number(month) - 1, 1);
          const label = `${getMonthName(d.getMonth())} ${String(year).slice(2)}`;
          monthsMap[sortKey] = {
            label,
            amount: item.amount,
            count: 1,
            sortKey,
          };
        }
      }
    });

    return Object.values(monthsMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6); // last 6 months
  }, [expenses]);

  const total6MonthSpend = monthlyData.reduce((sum, m) => sum + m.amount, 0);
  const averageMonthlySpend = monthlyData.length > 0 ? total6MonthSpend / monthlyData.length : 0;

  return (
    <div
      id="monthly-trends-chart-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Monthly Spending Trends</h3>
            <p className="text-xs text-gray-500">6-Month historical comparison</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-gray-400">
            <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
            <span>Monthly Spend</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-gray-400">
            <span className="w-3 h-0.5 bg-rose-400 inline-block" />
            <span>Budget ({formatCurrency(budgetConfig.monthlyBudget, budgetConfig.currencySymbol, budgetConfig.currencyCode)})</span>
          </div>
        </div>
      </div>

      {monthlyData.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-sm">No historical data recorded yet.</p>
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(val) => `${budgetConfig.currencySymbol}${val}`}
              />
              <Tooltip
                formatter={(value: any) => [
                  formatCurrency(Number(value) || 0, budgetConfig.currencySymbol, budgetConfig.currencyCode),
                  'Spent',
                ]}
                contentStyle={{
                  backgroundColor: '#161616',
                  color: '#f3f4f6',
                  borderRadius: '12px',
                  border: '1px solid #262626',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
              <ReferenceLine
                y={budgetConfig.monthlyBudget}
                stroke="#FB7185"
                strokeDasharray="4 4"
                label={{
                  value: 'Limit',
                  fill: '#F43F5E',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
