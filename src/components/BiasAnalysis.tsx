import React from 'react';
import { BiasMetrics } from './BiasMetrics';
import { DataTable } from './DataTable';

interface BiasAnalysisProps {
  results: any;
  metrics: any[];
  selectedMetric: string;
  selectedAttribute: string;
  onMetricChange: (metric: string) => void;
  onAttributeChange: (attribute: string) => void;
  plotData: string | null;
  loading: boolean;
  onUpdatePlot: (metric: string, attribute: string) => void;
}

export const BiasAnalysis: React.FC<BiasAnalysisProps> = ({
  results,
  metrics,
  selectedMetric,
  selectedAttribute,
  onMetricChange,
  onAttributeChange,
  plotData,
  loading,
  onUpdatePlot
}) => {
  if (!results) return null;

  return (
    <div className="space-y-8">
      <BiasMetrics
        metrics={metrics}
        selectedMetric={selectedMetric}
        selectedAttribute={selectedAttribute}
        protectedAttributes={results.protected_attributes || []}
        onMetricChange={onMetricChange}
        onAttributeChange={onAttributeChange}
        plotData={plotData}
        loading={loading}
        onUpdatePlot={onUpdatePlot}
      />

      <div className="space-y-8">
        {results.instance_per_subgroup && results.instance_per_subgroup.length > 0 && (
          <>
          <DataTable
            title="Total de Instancias por Subgrupo"
            data={results.instance_per_subgroup}
            translateHeader={(header) => header}
            formatNumber={(value) => value.toString()}
          />
          <div className="mt-2 mb-6 text-gray-700">
            <p className="mb-2">
              Esta tabla presenta un desglose completo de los resultados del modelo por subgrupo, es decir, por cada categoría dentro de las variables protegidas que seleccionaste. Por ejemplo, si estás evaluando la variable “edad”, los subgrupos podrían ser: menos de 25, 25–45 y más de 45.
            </p>
            <p className="mb-2">La tabla muestra para cada subgrupo:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><b>TP (Verdaderos Positivos):</b> Casos positivos correctamente predichos por el modelo.</li>
              <li><b>TN (Verdaderos Negativos):</b> Casos negativos correctamente predichos.</li>
              <li><b>FP (Falsos Positivos):</b> Casos negativos que el modelo clasificó como positivos.</li>
              <li><b>FN (Falsos Negativos):</b> Casos positivos que el modelo no detectó.</li>
              <li><b>PP (Positivos Predichos)</b> y <b>PN (Negativos Predichos):</b> Totales de predicciones positivas y negativas hechas por el modelo para ese subgrupo.</li>
              <li><b>Etiqueta positiva / negativa del grupo:</b> Cantidad real de casos positivos y negativos dentro del subgrupo.</li>
              <li><b>Group Size:</b> Total de instancias pertenecientes a ese subgrupo.</li>
              <li><b>Total de Instancias:</b> Total general de casos dentro de la variable protegida.</li>
            </ul>
            <p className="mb-2 font-semibold">¿Por qué es importante esta tabla?</p>
            <p className="mb-2">
              Esta vista te permite comprender cómo se comporta el modelo en cada subgrupo antes de calcular cualquier métrica de sesgo. Es clave para:
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li>Detectar desbalances en los datos que podrían afectar la equidad del modelo.</li>
              <li>Validar si hay suficiente información por grupo para realizar comparaciones significativas.</li>
              <li>Interpretar mejor los resultados de disparidad al tener claridad sobre los volúmenes que los sustentan.</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mt-4">
              <span className="font-semibold text-blue-800">Recomendación:</span> Pon atención especial a los subgrupos con pocos casos (bajo “Group Size”), ya que los resultados en esos grupos pueden ser menos estables o confiables.
            </div>
          </div>
          </>
        )}

        {results.metrics && results.metrics.length > 0 && (
          <>
          <DataTable
            title="Métricas de error para cada subgrupo"
            data={results.metrics}
            translateHeader={(header) => header}
            formatNumber={(value) => {
              if (typeof value === 'number') return value.toFixed(4);
              if (typeof value === 'string') return value;
              if (value === null || value === undefined) return '';
              return String(value);
            }}
          />
          <div className="mt-2 mb-6 text-gray-700">
            <p className="mb-2">
              Esta tabla muestra los resultados del modelo desagregados por subgrupo, calculando múltiples métricas de desempeño y error para cada uno. Los subgrupos corresponden a los valores dentro de cada variable protegida (por ejemplo: “mujer” dentro de género, “25–45” dentro de edad, etc.).
            </p>
            <p className="mb-2 font-semibold">¿Por qué es importante esta tabla?</p>
            <ul className="list-disc pl-6 mb-2">
              <li>Comparar el comportamiento del modelo entre subgrupos, identificando si ciertos grupos están sistemáticamente peor clasificados.</li>
              <li>Detectar patrones de disparidad, como mayor tasa de falsos positivos o falsos negativos en grupos específicos.</li>
              <li>Interpretar las métricas de sesgo en contexto, considerando tanto el rendimiento como la prevalencia de los casos.</li>
            </ul>
          </div>
          </>
        )}
      </div>
    </div>
  );
};