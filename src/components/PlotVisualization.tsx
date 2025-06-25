import React from 'react';
import { BarChart2 } from 'lucide-react';

interface PlotVisualizationProps {
  plotData: string;
  title: string;
}

export const PlotVisualization: React.FC<PlotVisualizationProps> = ({
  plotData,
  title
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart2 className="h-5 w-5" />
        {title}
      </h3>
      <div className="relative w-full" style={{ minHeight: "400px" }}>
        <img
          src={`data:image/png;base64,${plotData}`}
          alt="Gráfico de disparidad"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};