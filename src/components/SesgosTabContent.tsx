
import React from 'react';
import { AbsolutePlotter } from './bias-analysis/AbsolutePlotter';
import { DataTable } from './DataTable';
import { METRIC_TRANSLATIONS } from '../constants';

interface SesgosTabContentProps {
  results: any;
  BASE_API_URL: string;
}

export const SesgosTabContent: React.FC<SesgosTabContentProps> = ({ results, BASE_API_URL }) => {
  if (!results) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Ejecuta un análisis para ver los resultados de sesgo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AbsolutePlotter 
        groupMetrics={results.tables.group_metrics_for_plotting}
        protectedAttributes={results.metadata.protected_attributes}
        BASE_API_URL={BASE_API_URL}
      />
      <DataTable
        title="Total de instancias por subgrupo"
        data={results.tables.group_counts}
        translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}
        formatNumber={(v) => String(v)}
      />
      <DataTable
        title="Métricas de error para cada subgrupo"
        data={results.tables.group_metrics}
        translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}
        formatNumber={(v) => String(v)}
      />
    </div>
  );
};
