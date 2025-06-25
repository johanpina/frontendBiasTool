import React from 'react';
import { BarChart2 } from 'lucide-react';

interface AnalysisButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export const AnalysisButton: React.FC<AnalysisButtonProps> = ({
  onClick,
  disabled,
  loading
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white font-medium transition-colors
        ${!disabled
          ? 'bg-indigo-600 hover:bg-indigo-700'
          : 'bg-gray-400 cursor-not-allowed'
        }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Analizando...</span>
        </>
      ) : (
        <>
          <BarChart2 className="h-5 w-5" />
          <span>Realizar Análisis de Disparidad</span>
        </>
      )}
    </button>
  );
};