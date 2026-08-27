import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Expense } from '../../types';
import { exportExpensesToCSV } from '../../utils/formatters';
import { useExpenses } from '../../context/ExpenseContext';

interface ExportImportControlsProps {
  filteredExpenses: Expense[];
}

export const ExportImportControls: React.FC<ExportImportControlsProps> = ({ filteredExpenses }) => {
  const { budgetConfig } = useExpenses();

  const handleExportCSV = () => {
    exportExpensesToCSV(filteredExpenses, budgetConfig.currencySymbol);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" id="export-import-controls">
      {/* CSV Export */}
      <button
        type="button"
        id="export-csv-btn"
        onClick={handleExportCSV}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161616] border border-[#262626] text-gray-300 hover:text-white hover:bg-[#1f1f1f] hover:border-[#333] font-semibold text-xs transition-colors"
        title="Download CSV spreadsheet"
      >
        <FileSpreadsheet size={14} className="text-emerald-400" />
        <span>Export CSV</span>
      </button>
    </div>
  );
};
