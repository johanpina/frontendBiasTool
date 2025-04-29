export interface MetricDefinition {
  name: string;
  description: string;
}

export interface ColumnSelection {
  predictions: string;
  actual: string;
  protected: string[];
}

export interface PreviewData {
  columns: string[];
  rows: Record<string, any>[];
}