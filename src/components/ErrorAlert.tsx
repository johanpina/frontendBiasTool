import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <p className="ml-3 text-red-700">{message}</p>
      </div>
    </div>
  );
};