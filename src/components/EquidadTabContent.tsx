
import React from 'react';
import { FairnessAnalysis } from './FairnessAnalysis';
import { DisparityPlotter } from './bias-analysis/DisparityPlotter';
import { DataTable } from './DataTable';
import { METRIC_TRANSLATIONS } from '../constants';

interface EquidadTabContentProps {
  results: any;
  loading: boolean;
  onAnalyze: (params: any) => void;
  BASE_API_URL: string;
}

export const EquidadTabContent: React.FC<EquidadTabContentProps> = ({
  results,
  loading,
  onAnalyze,
  BASE_API_URL,
}) => {
  // El componente FairnessAnalysis necesita las columnas y sus valores únicos
  const protectedColumns = results?.metadata?.protected_attributes || [];
  const uniqueValues = results?.metadata?.unique_values || {};

  return (
    <div className="space-y-8">
      <FairnessAnalysis
        protectedColumns={protectedColumns}
        uniqueValues={uniqueValues}
        onAnalyze={onAnalyze}
        results={results}
        loading={loading}
      />

      {results && (
        <div className="space-y-8 mt-8">
          <DisparityPlotter 
            biasMetrics={results.tables.bias_metrics}
            protectedAttributes={protectedColumns}
            fairnessThreshold={results.metadata.fairness_threshold || 1.25}
            BASE_API_URL={BASE_API_URL}
          />
          <DataTable
            title="Métricas de Disparidad (Análisis de Equidad)"
            data={results.tables.bias_metrics}
            translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}
            formatNumber={(v) => String(v)}
          />
          <DataTable
            title="Resumen de Equidad por Atributo"
            data={results.tables.fairness_summary}
            translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}
            formatNumber={(v) => String(v)}
          />
          <DataTable
            title="Test de Equidad Estadística por Atributo"
            data={results.tables.fairness_by_attribute}
            translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}
            formatNumber={(v) => String(v)}
          />
        </div>
      )}
    </div>
  );
};
