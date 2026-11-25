import React from 'react';
import { Info } from 'lucide-react';

export const InfoAlert: React.FC = () => {
  return (

    <div className="bg-indigo-50 border-l-4 border-burgundy p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-burgundy" />
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-burgundy">
            Privacidad:
          </h4>
          <div className="mt-2 text-sm text-ink-80">
            <p>Tu archivo se envía a nuestro servidor solo para calcular los resultados. No lo guardamos: se elimina al terminar el análisis.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};