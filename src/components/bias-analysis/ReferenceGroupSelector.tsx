import React from 'react';

interface ReferenceGroupSelectorProps {
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  referenceGroups: Record<string, string>;
  onGroupChange: (attribute: string, value: string) => void;
}

export const ReferenceGroupSelector: React.FC<ReferenceGroupSelectorProps> = ({
  protectedColumns,
  uniqueValues,
  referenceGroups,
  onGroupChange
}) => {
  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-sm font-medium text-gray-700">
        Seleccionar subgrupos de referencia
      </h4>
      <p className="text-sm text-gray-600 mb-2">
        Selecciona el grupo correspondiente para cada variable protegida.
      </p>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mb-2">
        <span className="font-semibold text-blue-800">Nota:</span> Si deseas concentrarte en una variable protegida a la vez, recuerda que puedes cargar solo esa variable al inicio de la herramienta. Luego puedes repetir el proceso para las demás variables cuando lo necesites.
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Una vez configurado, haz click en <b>Realizar Análisis de Equidad</b>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {protectedColumns.map((attribute) => (
          <div key={attribute} className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {attribute}
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={referenceGroups[attribute] || ''}
              onChange={(e) => onGroupChange(attribute, e.target.value)}
            >
              <option value="">Seleccionar grupo de referencia</option>
              {uniqueValues[attribute]?.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};