import React from 'react';
import { PreviewData } from '../types';

interface DataPreviewProps {
  previewData: PreviewData;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ previewData }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">Vista Previa de Datos</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {previewData.columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.preview && previewData.preview.slice(0, 5).map((row, idx) => (
              <tr key={idx}>
                {previewData.columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};