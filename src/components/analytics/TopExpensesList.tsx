import React from 'react';
import { Award, ArrowUpRight } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { CATEGORY_DETAILS } from '../../constants/categories';

export const TopExpensesList: React.FC = () => {
  const { expenses, budgetConfig } = useExpenses();

  const topItems = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div
      id="top-expenses-list-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
          <Award size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white leading-tight">Largest Expenditures</h3>
          <p className="text-xs text-gray-500">Top 5 biggest single transactions</p>
        </div>
      </div>

      {topItems.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">No expenses recorded yet.</div>
      ) : (
        <div className="divide-y divide-[#1f1f1f]">
          {topItems.map((item, idx) => {
            const catDetails = CATEGORY_DETAILS[item.category];

            return (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-xs font-bold text-gray-500 font-mono">
                    #{idx + 1}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      catDetails ? catDetails.lightBg + ' ' + catDetails.borderClass : 'bg-[#161616]'
                    }`}
                  >
                    <CategoryIcon name={item.category} size={15} className={catDetails?.colorText} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.category} • {formatDate(item.date)}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-extrabold text-rose-400 font-mono shrink-0">
                  {formatCurrency(item.amount, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
