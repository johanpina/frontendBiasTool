import React from 'react';
import { Users, CheckSquare } from 'lucide-react';
import { RadioGroup } from '@headlessui/react';

export const referenceMethodOptions = [
  { id: 'custom', name: 'Personalizado', description: 'Seleccionar manualmente los grupos de referencia' },
  { id: 'majority', name: 'Grupo Mayoritario', description: 'Usar el grupo con mayor cantidad de instancias como referencia' },
  { id: 'minority', name: 'Grupo Minoritario', description: 'Usar el grupo con menor cantidad de instancias como referencia' }
];

interface ReferenceMethodSelectorProps {
  referenceMethod: string;
  onMethodChange: (method: string) => void;
}

export const ReferenceMethodSelector: React.FC<ReferenceMethodSelectorProps> = ({
  referenceMethod,
  onMethodChange
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Método de Selección de Grupos de Referencia
      </h3>
      
      <RadioGroup value={referenceMethod} onChange={onMethodChange} className="space-y-4">
        {referenceMethodOptions.map((option) => (
          <RadioGroup.Option
            key={option.id}
            value={option.id}
            className={({ checked }) =>
              `${checked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}
               relative flex cursor-pointer rounded-lg px-5 py-4 border-2 focus:outline-none`
            }
          >
            {({ checked }) => (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <RadioGroup.Label
                      as="p"
                      className={`font-medium ${checked ? 'text-indigo-900' : 'text-gray-900'}`}
                    >
                      {option.name}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className={`inline ${checked ? 'text-indigo-700' : 'text-gray-500'}`}
                    >
                      {option.description}
                    </RadioGroup.Description>
                  </div>
                </div>
                {checked && (
                  <div className="shrink-0 text-indigo-500">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                )}
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  );
};