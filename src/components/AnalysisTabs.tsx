import React from 'react';
import { Tab } from '@headlessui/react';
import { FairnessAnalysis } from './FairnessAnalysis';

interface AnalysisTabsProps {
  results: any;
  loading: boolean;
  onBiasAnalysis: (params: any) => void;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  results,
  loading,
  onBiasAnalysis,
}) => {
  console.log("LOG: Datos en AnalysisTabs", { results });
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {['Análisis de Sesgos','Análisis de Equidad'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                 ${selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel className="rounded-xl bg-white p-3">
            {/* BiasAnalysis component can be placed here if needed */}
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white p-3">
            <FairnessAnalysis
              protectedColumns={results?.metadata?.protected_attributes || []}
              uniqueValues={results?.metadata?.unique_values || {}}
              onAnalyze={onBiasAnalysis}
              results={results}
              loading={loading}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};