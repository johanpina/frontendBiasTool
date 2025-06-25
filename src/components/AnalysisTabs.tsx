import React from 'react';
import { Tab } from '@headlessui/react';
import { BiasAnalysis } from './BiasAnalysis';
import { ReferenceGroupAnalysis } from './ReferenceGroupAnalysis';
import { BiasAnalysisTab } from './BiasAnalysisTab';
import { metrics } from '../constants';

interface AnalysisTabsProps {
  results: any;
  selectedMetric: string;
  selectedAttribute: string;
  plotData: string | null;
  loading: boolean;
  onBiasAnalysis: (params: any) => void;
  setSelectedMetric: (metric: string) => void;
  setSelectedAttribute: (attribute: string) => void;
  onUpdatePlot: (metric: string, attribute: string) => void;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  results,
  selectedMetric,
  selectedAttribute,
  plotData,
  loading,
  onBiasAnalysis,
  setSelectedMetric,
  setSelectedAttribute,
  onUpdatePlot
}) => {
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {['Análisis de Sesgos','Análisis de Disparidad'].map((tab) => (
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
            <BiasAnalysis
              results={results}
              metrics={metrics}
              selectedMetric={selectedMetric}
              selectedAttribute={selectedAttribute}
              onMetricChange={setSelectedMetric}
              onAttributeChange={setSelectedAttribute}
              plotData={plotData}
              loading={loading}
              onUpdatePlot={onUpdatePlot}
            />
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white p-3">
            <BiasAnalysisTab
              protectedColumns={results.protected_attributes}
              uniqueValues={results.unique_values}
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