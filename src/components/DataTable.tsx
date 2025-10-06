import React from 'react';
import { Users, CheckSquare, Square } from 'lucide-react';

interface DataTableProps {
  title: string;
  data: any[];
  translateHeader: (header: string) => string;
  formatNumber: (value: number) => string;
  highlightRowKey?: string;
  highlightRowValue?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  translateHeader,
  formatNumber,
  highlightRowKey,
  highlightRowValue,
}) => {
  // Early return if data is invalid
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) {
    return null;
  }

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckSquare className="h-5 w-5 text-green-600" />
      ) : (
        <Square className="h-5 w-5 text-gray-400" />
      );
    }
    
    // Si es un número, formatearlo según las reglas
    if (typeof value === 'number') {
      // Si es un número entero o muy cercano a un entero
      if (Math.abs(Math.round(value) - value) < 0.00001) {
        return Math.round(value).toString();
      }
      
      // Para valores decimales, mostrar 4 decimales
      if (value < 1) {
        return value.toFixed(4);
      }
      
      // Para valores mayores a 1, mostrar 2 decimales
      return value.toFixed(2);
    }
    
    // Para valores nulos o indefinidos
    if (value === null || value === undefined) {
      return '-';
    }
    
    // Para cualquier otro tipo de valor
    return value.toString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Users size={24} />
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(data[0]).map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {translateHeader(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => {
              const isHighlighted = highlightRowKey && highlightRowValue && row[highlightRowValue] === highlightRowKey;
              return (
                <tr key={index} className={`${isHighlighted ? 'bg-yellow-100' : ''}`}>
                  {Object.values(row).map((value: any, i: number) => (
                    <td
                      key={i}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      <div className="flex items-center">
                        {formatValue(value)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};