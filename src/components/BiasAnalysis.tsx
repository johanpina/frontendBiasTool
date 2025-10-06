
import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { PlotVisualization } from './PlotVisualization';
import { PlotControls } from './PlotControls';
import { METRIC_TRANSLATIONS } from '../constants';
import { GroupMetricPlot } from './GroupMetricPlot';

interface BiasAnalysisProps {
  results: any;
  recommendedMetric?: string;
  BASE_API_URL: string;
}

export const BiasAnalysis: React.FC<BiasAnalysisProps> = ({ results, recommendedMetric, BASE_API_URL }) => {

  const [disparityPlot, setDisparityPlot] = useState(results?.plots?.disparity_summary || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisparityPlot(results?.plots?.disparity_summary || null);
  }, [results]);

  if (!results) return null;

  const handleUpdateDisparityPlot = async (metrics: string[], attributes: string[]) => {
    setLoading(true);
    try {
      const payload = {
        plot_type: 'disparity',
        bias_metrics: results.tables.bias_metrics,
        metrics: metrics,
        attributes: attributes,
      };

      const response = await fetch(`${BASE_API_URL}/api/rerender_plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al regenerar el gráfico de disparidad');
      }

      const data = await response.json();
      setDisparityPlot(data.plot);

    } catch (error) {
      console.error("Error updating plot:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Nuevo Visualizador Interactivo de Métricas de Grupo */}
      {results.tables?.group_metrics_for_plotting && (
        <GroupMetricPlot 
          groupMetrics={results.tables.group_metrics_for_plotting}
          protectedAttributes={results.metadata.protected_attributes}
          BASE_API_URL={BASE_API_URL}
        />
      )}

      {/* Gráfico de Disparidad con sus controles */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Resumen Gráfico de Disparidad</h2>
        <PlotControls 
          results={results} 
          onUpdate={handleUpdateDisparityPlot} 
          loading={loading}
        />
        <PlotVisualization 
          title="Resumen Gráfico de Disparidad"
          plotData={disparityPlot}
        />
      </div>

      {/* Tablas de Datos */}
      {results.tables?.group_metrics && (
        <DataTable
          title="Métricas y Conteos por Subgrupo"
          data={results.tables.group_metrics}
          translateHeader={(header) => METRIC_TRANSLATIONS[header] || header}
          formatNumber={(v) => String(v)}
        />
      )}

      {results.tables?.bias_metrics && (
        <DataTable
          title="Métricas de Disparidad"
          data={results.tables.bias_metrics}
          translateHeader={(header) => METRIC_TRANSLATIONS[header] || header}
          formatNumber={(v) => String(v)}
          highlightRowKey={recommendedMetric}
          highlightRowValue="metric"
        />
      )}
    </div>
  );
};