
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  title: string;
}

export const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ options, selected, onChange, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleSelect = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <span className="block truncate">
          {selected.length === 0 ? `Seleccionar ${title}` : `${selected.length} ${title} seleccionados`}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-md max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                onClick={() => handleSelect(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                    checked={selected.includes(option)}
                    readOnly
                  />
                  <span className={`font-normal block truncate ${selected.includes(option) ? 'font-semibold' : ''}`}>
                    {option}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
