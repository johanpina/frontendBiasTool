import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, X } from 'lucide-react';
import { ColumnSelection } from '../types';

interface ColumnSelectorProps {
  columnSelection: ColumnSelection;
  previewData: { columns: string[] };
  onColumnSelectionChange: (field: keyof ColumnSelection, value: string | string[]) => void;
  onSelectAllProtected: () => void;
  onRemoveProtectedColumn: (column: string) => void;
  onAddProtectedColumn: (column: string) => void;
  getAvailableColumns: () => string[];
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columnSelection,
  previewData,
  onColumnSelectionChange,
  onSelectAllProtected,
  onRemoveProtectedColumn,
  onAddProtectedColumn,
  getAvailableColumns,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Columna de Predicciones
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={columnSelection.predictions}
            onChange={(e) => onColumnSelectionChange('predictions', e.target.value)}
          >
            <option value="">Seleccionar columna</option>
            {previewData.columns.map((column) => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Columna de Valores Reales
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={columnSelection.actual}
            onChange={(e) => onColumnSelectionChange('actual', e.target.value)}
          >
            <option value="">Seleccionar columna</option>
            {previewData.columns.map((column) => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-lg font-medium text-gray-900">
            Selecciona las columnas que quieres analizar
          </label>
          <button
            type="button"
            onClick={onSelectAllProtected}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Seleccionar todas
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {columnSelection.protected.map((column) => (
            <span
              key={column}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
            >
              {column}
              <button
                type="button"
                onClick={() => onRemoveProtectedColumn(column)}
                className="ml-1 hover:text-red-900"
              >
                <X size={16} />
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <Listbox
            value=""
            onChange={onAddProtectedColumn}
          >
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300">
                <span className="block truncate text-gray-500">
                  Seleccionar columna...
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={React.Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {getAvailableColumns().map((column) => (
                    <Listbox.Option
                      key={column}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                        }`
                      }
                      value={column}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {column}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>
    </>
  );
};