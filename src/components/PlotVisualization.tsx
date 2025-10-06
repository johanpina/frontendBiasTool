
import React from 'react';

interface PlotVisualizationProps {
  title: string;
  plotData: string | null;
}

export const PlotVisualization: React.FC<PlotVisualizationProps> = ({ title, plotData }) => {
  if (!plotData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-500">No hay datos para mostrar el gráfico.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex justify-center">
        <img src={plotData} alt={title} />
      </div>
    </div>
  );
};
