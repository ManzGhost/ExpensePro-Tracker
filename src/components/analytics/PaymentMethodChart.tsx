import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CreditCard } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { calculateTotals, formatCurrency } from '../../utils/formatters';
import { PaymentIcon } from '../common/CategoryIcon';
import { PaymentMethod } from '../../types';

const PAYMENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const PaymentMethodChart: React.FC = () => {
  const { expenses, budgetConfig } = useExpenses();
  const totals = calculateTotals(expenses);

  const data = useMemo(() => {
    return Object.entries(totals.paymentTotals)
      .map(([method, amount], idx) => ({
        name: method,
        amount: amount || 0,
        color: PAYMENT_COLORS[idx % PAYMENT_COLORS.length],
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [totals.paymentTotals]);

  return (
    <div
      id="payment-methods-chart-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
          <CreditCard size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white leading-tight">Payment Methods</h3>
          <p className="text-xs text-gray-500">Spending breakdown by method</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-10 text-center text-gray-500 text-sm">No payment data recorded.</div>
      ) : (
        <div className="space-y-3 pt-2">
          {data.map((item) => {
            const percentage = totals.totalAllTime > 0 ? (item.amount / totals.totalAllTime) * 100 : 0;

            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <PaymentIcon method={item.name as PaymentMethod} size={14} className="text-gray-400" />
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-gray-500 font-normal">({percentage.toFixed(0)}%)</span>
                    <span className="text-white font-bold">
                      {formatCurrency(item.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
