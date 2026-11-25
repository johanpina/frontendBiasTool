import { EdaColumn, EdaResult } from '../types';
import { orderClasses } from './classOrder';
import { fmtInt } from './format';

// Más valores que esto en la predicción = probablemente un puntaje continuo.
const MAX_CLASSES = 12;

export interface ModelInfo {
  kind: 'binary' | 'multiclass' | null;
  classes: string[];
  /** Problemas que impiden analizar (U8). */
  errors: string[];
}

const valuesOf = (c?: EdaColumn) =>
  (c?.top_values || []).filter((t: any) => !t.is_aggregate).map((t: any) => String(t.value));

/** Tipo de modelo y clases a partir de la exploración (paso 2) y las columnas elegidas. */
export function getModelInfo(eda: EdaResult | null, pred: string, actual: string): ModelInfo {
  const none: ModelInfo = { kind: null, classes: [], errors: [] };
  if (!pred || !actual) return none;
  if (pred === actual) {
    return { ...none, errors: ['Elegiste la misma columna para predicciones y valores reales. Elige columnas distintas.'] };
  }
  if (!eda) return none; // sin exploración no podemos validar: decide el servidor.

  const pc = eda.columns.find((c) => c.name === pred);
  const ac = eda.columns.find((c) => c.name === actual);
  const pv = valuesOf(pc);
  const av = valuesOf(ac);
  const errors: string[] = [];

  if ((pc?.unique ?? 0) > MAX_CLASSES) {
    errors.push(`La columna de predicciones tiene ${fmtInt(pc!.unique)} valores distintos. Usa una predicción con clases (ej.: 0 y 1, o Alto/Medio/Bajo), no un puntaje continuo.`);
  } else if ((pc?.unique ?? 0) === 1) {
    errors.push(`La columna de predicciones tiene un solo valor (${pv[0]}). Se necesitan al menos 2 para medir errores.`);
  }
  const complete = (c: EdaColumn | undefined, v: string[]) => !!c && c.unique <= v.length;
  if (!errors.length && complete(pc, pv) && complete(ac, av)) {
    const missing = pv.filter((v) => !av.includes(v));
    if (missing.length) {
      errors.push(`La columna de predicciones tiene valores que no aparecen en valores reales: ${missing.join(', ')}. Revisa que ambas usen las mismas categorías.`);
    }
  }
  if (errors.length) return { kind: null, classes: [], errors };

  const classes = orderClasses([...pv, ...av]);
  return { kind: classes.length === 2 ? 'binary' : classes.length > 2 ? 'multiclass' : null, classes, errors };
}

/** Clase positiva por defecto: 1 en modelos 0/1; en el resto la elige la persona. */
export function defaultPositive(info: ModelInfo): string {
  if (info.kind === 'binary' && info.classes.every((c) => c === '0' || c === '1')) return '1';
  return '';
}

/** Columnas elegidas como protegidas que parecen identificadores (U9). */
export function idLikeColumns(eda: EdaResult | null, protectedCols: string[]) {
  if (!eda) return [];
  return protectedCols
    .map((name) => eda.columns.find((c) => c.name === name))
    .filter((c): c is EdaColumn => !!c && (c.role_hint === 'id' || (c.unique > 20 && c.unique / eda.n_rows > 0.5)))
    .map((c) => ({ name: c.name, unique: c.unique, perGroup: eda.n_rows / c.unique }));
}
