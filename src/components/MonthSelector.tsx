import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ currentMonth, onMonthChange }) => {
  const formatDisplayMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    onMonthChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-900 rounded-2xl border border-gray-800 p-1.5">
      <button
        onClick={() => changeMonth('prev')}
        className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="text-sm sm:text-base font-bold text-blue-300 capitalize">
          {formatDisplayMonth(currentMonth)}
        </span>
      </div>

      <button
        onClick={() => changeMonth('next')}
        className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all text-sm font-medium"
      >
        <span className="hidden sm:inline">Próximo</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};