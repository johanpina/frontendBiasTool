import React, { useState } from 'react';
import { RefreshCw, ChevronDown, X } from 'lucide-react';
import { MetricDefinition } from '../../types';

interface DisparityPlotControlsProps {
  metrics: MetricDefinition[];
  protectedAttributes: string[];
  onUpdatePlot: (selectedMetrics: string[], selectedAttributes: string[]) => void;
  loading: boolean;
}

export const DisparityPlotControls: React.FC<DisparityPlotControlsProps> = ({
  metrics,
  protectedAttributes,
  onUpdatePlot,
  loading
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);

  const handleMetricChange = (metric: string) => {
    setSelectedMetrics(prev => {
      const newMetrics = prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric];
      setPendingChanges(true);
      return newMetrics;
    });
  };

  const handleAttributeChange = (attribute: string) => {
    setSelectedAttributes(prev => {
      const newAttributes = prev.includes(attribute)
        ? prev.filter(a => a !== attribute)
        : [...prev, attribute];
      setPendingChanges(true);
      return newAttributes;
    });
  };

  const handleSelectAllMetrics = () => {
    setSelectedMetrics(prev => {
      const newMetrics = prev.length === metrics.length ? [] : metrics.map(m => m.name);
      setPendingChanges(true);
      return newMetrics;
    });
  };

  const handleSelectAllAttributes = () => {
    setSelectedAttributes(prev => {
      const newAttributes = prev.length === protectedAttributes.length ? [] : [...protectedAttributes];
      setPendingChanges(true);
      return newAttributes;
    });
  };

  const removeMetric = (metric: string) => {
    setSelectedMetrics(prev => {
      const newMetrics = prev.filter(m => m !== metric);
      setPendingChanges(true);
      return newMetrics;
    });
  };

  const removeAttribute = (attribute: string) => {
    setSelectedAttributes(prev => {
      const newAttributes = prev.filter(a => a !== attribute);
      setPendingChanges(true);
      return newAttributes;
    });
  };

  const handleUpdatePlot = () => {
    onUpdatePlot(
      selectedMetrics.length === 0 ? ['all'] : selectedMetrics,
      selectedAttributes
    );
    setPendingChanges(false);
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Configuración de Visualización de Disparidad</h2>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Métricas a visualizar
          </h3>
          <button
            onClick={handleSelectAllMetrics}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            {selectedMetrics.length === metrics.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {selectedMetrics.map(metric => (
            <span
              key={metric}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
            >
              {metric}
              <button
                onClick={() => removeMetric(metric)}
                className="ml-2 hover:text-indigo-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50 bg-white text-gray-500"
          >
            <span>Seleccionar métrica...</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${isMetricsExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isMetricsExpanded && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {metrics.map(metric => (
                <button
                  key={metric.name}
                  onClick={() => {
                    handleMetricChange(metric.name);
                    setIsMetricsExpanded(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                >
                  <div>
                    <div className="font-medium">{metric.description}</div>
                    <div className="text-sm text-gray-500">{metric.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Variables protegidas a analizar
          </h3>
          <button
            onClick={handleSelectAllAttributes}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            {selectedAttributes.length === protectedAttributes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {selectedAttributes.map(attribute => (
            <span
              key={attribute}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
            >
              {attribute}
              <button
                onClick={() => removeAttribute(attribute)}
                className="ml-2 hover:text-indigo-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsAttributesExpanded(!isAttributesExpanded)}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50 bg-white text-gray-500"
          >
            <span>Seleccionar variable protegida...</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${isAttributesExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isAttributesExpanded && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {protectedAttributes.map(attribute => (
                <button
                  key={attribute}
                  onClick={() => {
                    handleAttributeChange(attribute);
                    setIsAttributesExpanded(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                >
                  {attribute}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleUpdatePlot}
        disabled={loading || !pendingChanges}
        className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg text-white font-medium transition-colors
          ${loading || !pendingChanges ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {loading ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Actualizando visualización...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5" />
            <span>Actualizar visualización</span>
          </>
        )}
      </button>
    </div>
  );
};