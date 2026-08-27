import React, { useMemo } from 'react';
import { CalendarDays, Sun, Moon } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DayOfWeekHeatmap: React.FC = () => {
  const { expenses, budgetConfig } = useExpenses();

  const dayStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const totals = [0, 0, 0, 0, 0, 0, 0];

    expenses.forEach((item) => {
      if (item.date) {
        const [year, month, day] = item.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayIdx = dateObj.getDay(); // 0 is Sunday
        counts[dayIdx] += 1;
        totals[dayIdx] += item.amount;
      }
    });

    const maxTotal = Math.max(...totals, 1);

    return DAYS.map((dayName, idx) => ({
      name: dayName,
      total: totals[idx],
      count: counts[idx],
      intensity: totals[idx] / maxTotal,
    }));
  }, [expenses]);

  return (
    <div
      id="day-of-week-heatmap-card"
      className="p-6 rounded-3xl bg-[#121212] border border-[#222] shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
          <CalendarDays size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white leading-tight">Weekly Spending Habits</h3>
          <p className="text-xs text-gray-500">Expenditures by day of the week</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2">
        {dayStats.map((d) => {
          let bgClass = 'bg-[#161616] border-[#222] text-gray-500';
          if (d.intensity > 0.7) {
            bgClass = 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20';
          } else if (d.intensity > 0.4) {
            bgClass = 'bg-indigo-950/80 border-indigo-800/80 text-indigo-200';
          } else if (d.intensity > 0.15) {
            bgClass = 'bg-indigo-950/40 border-indigo-900/40 text-indigo-300';
          } else if (d.total > 0) {
            bgClass = 'bg-[#161616] border-[#262626] text-gray-300';
          }

          return (
            <div
              key={d.name}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${bgClass}`}
            >
              <span className="text-xs font-bold uppercase">{d.name}</span>
              <span className="text-xs font-extrabold font-mono mt-2 truncate w-full">
                {d.total > 0
                  ? formatCurrency(d.total, budgetConfig.currencySymbol, budgetConfig.currencyCode)
                  : '—'}
              </span>
              <span className="text-[10px] opacity-75 mt-0.5">{d.count} txns</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
