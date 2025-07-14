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
          <h4 className="text-sm font-medium text-blue-800">
            Privacidad:
          </h4>
          <div className="mt-2 text-sm text-blue-700">
            <p>La herramienta no almacena ni transmite tu información. Puedes cambiar el archivo en cualquier momento haciendo clic en el área de carga.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};