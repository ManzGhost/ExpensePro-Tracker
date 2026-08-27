import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useExpenses();

  return (
    <aside aria-label="Notifications" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white border-slate-800';
          let icon = <Info className="text-blue-400 shrink-0" size={18} />;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-950/95 text-emerald-100 border-emerald-800 shadow-emerald-950/20';
            icon = <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-950/95 text-rose-100 border-rose-800 shadow-rose-950/20';
            icon = <AlertCircle className="text-rose-400 shrink-0" size={18} />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-950/95 text-amber-100 border-amber-800 shadow-amber-950/20';
            icon = <AlertTriangle className="text-amber-400 shrink-0" size={18} />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-slate-900/95 text-slate-100 border-slate-700 shadow-slate-900/20';
            icon = <Info className="text-sky-400 shrink-0" size={18} />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md ${bgClass}`}
              id={`toast-item-${toast.id}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs opacity-85 mt-0.5 leading-snug break-words">{toast.description}</p>
                )}
              </div>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-1 rounded-md transition-opacity"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
};
