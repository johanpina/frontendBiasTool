import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ValidationWarningProps {
  show: boolean;
  message: string;
}

export const ValidationWarning: React.FC<ValidationWarningProps> = ({
  show,
  message
}) => {
  if (!show) return null;

  return (
    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <p className="ml-3 text-yellow-700">{message}</p>
      </div>
    </div>
  );
};