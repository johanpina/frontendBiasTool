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

// --- EDA (Análisis Exploratorio) ---
export interface EdaTopValue {
  value: string;
  count: number;
  pct: number;
  is_aggregate?: boolean;
}

export interface EdaHistBin {
  x0: number;
  x1: number;
  count: number;
}

export interface EdaColumn {
  name: string;
  dtype: 'numeric' | 'categorical' | 'binary';
  missing: number;
  missing_pct: number;
  unique: number;
  top_values: EdaTopValue[];
  categorical_like: boolean;
  role_hint: 'outcome' | 'protected' | 'id' | 'feature';
  stats: null | {
    min: number; max: number; mean: number; std: number; median: number;
  };
  histogram?: EdaHistBin[];
  balance?: { evenness: number; label: 'equilibrada' | 'moderada' | 'desbalanceada' };
}

export interface EdaCrosstab {
  x_values: string[];
  y_values: string[];
  counts: number[][];
}

export interface EdaAlert {
  level: 'critical' | 'warning' | 'info';
  type: string;
  columns: string[];
  message: string;
}

export interface EdaResult {
  n_rows: number;
  n_cols: number;
  missing_cells_pct: number;
  columns: EdaColumn[];
  associations: { columns: string[]; matrix: number[][] };
  crosstabs: Record<string, EdaCrosstab>;
  crosstab_columns: string[];
  alerts: EdaAlert[];
  min_group_size: number;
}