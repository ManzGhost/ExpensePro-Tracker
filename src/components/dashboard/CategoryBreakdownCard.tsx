import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../../context/ExpenseContext';
import { calculateTotals, formatCurrency } from '../../utils/formatters';
import { CATEGORY_DETAILS } from '../../constants/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { ExpenseCategory } from '../../types';

export const CategoryBreakdownCard: React.FC = () => {
  const { expenses, budgetConfig } = useExpenses();
  const totals = calculateTotals(expenses);

  const chartData = useMemo(() => {
    return Object.entries(totals.categoryTotals)
      .map(([category, amount]) => {
        const cat = category as ExpenseCategory;
        const info = CATEGORY_DETAILS[cat];
        return {
          name: cat,
          value: amount || 0,
          color: info?.colorHex || '#64748B',
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [totals.categoryTotals]);

  const totalSpent = totals.totalAllTime;

  return (
    <div
      id="category-breakdown-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <PieIcon size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Category Breakdown</h3>
            <p className="text-xs text-gray-500">All-time spending distribution</p>
          </div>
        </div>

        <Link
          to="/analytics"
          id="view-detailed-analytics-link"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View Analytics <ArrowRight size={14} />
        </Link>
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-sm">No expense records available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Chart visual */}
          <div className="md:col-span-5 h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value) || 0, budgetConfig.currencySymbol, budgetConfig.currencyCode),
                    'Spent',
                  ]}
                  contentStyle={{
                    backgroundColor: '#121212',
                    color: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #222',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Total
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {formatCurrency(totalSpent, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
              </span>
            </div>
          </div>

          {/* Category Top List */}
          <div className="md:col-span-7 space-y-3">
            {chartData.slice(0, 5).map((item) => {
              const percentage = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-300 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-gray-500 text-[11px] font-normal">
                        ({percentage.toFixed(0)}%)
                      </span>
                      <span className="font-bold text-white">
                        {formatCurrency(item.value, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {chartData.length > 5 && (
              <p className="text-[11px] text-gray-500 text-right pt-1 font-medium">
                +{chartData.length - 5} more categories
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
