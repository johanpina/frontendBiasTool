import React from 'react';
import { Info } from 'lucide-react';

export const InfoAlert: React.FC = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Formato esperado del archivo CSV
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>El archivo debe contener columnas para:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Predicciones del modelo</li>
              <li>Valores reales</li>
              <li>Variables protegidas (características demográficas)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};