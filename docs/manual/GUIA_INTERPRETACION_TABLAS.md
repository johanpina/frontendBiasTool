---
title: "Guía para interpretar las tablas y gráficos"
subtitle: "Herramienta de Medición de Sesgos y Equidad — GobLab UAI"
---

# Guía para interpretar las tablas y gráficos

Este documento explica, columna por columna, qué muestran las tablas de la
herramienta y cómo leer los gráficos. Está pensado para equipos que trabajan en
proyectos de ciencia de datos, sin necesidad de un fondo estadístico avanzado.

---

## 0. Antes de empezar: la matriz de confusión

Casi todo lo que verás se construye a partir de **cuatro conteos** que comparan
lo que **predijo** el modelo con lo que **realmente ocurrió** (la etiqueta real):

| | Realidad: Positivo | Realidad: Negativo |
|---|---|---|
| **Predijo Positivo** | **VP** — Verdadero Positivo (acertó) | **FP** — Falso Positivo (marcó de más) |
| **Predijo Negativo** | **FN** — Falso Negativo (se le escapó) | **VN** — Verdadero Negativo (acertó) |

- **VP (Verdadero Positivo):** el modelo dijo "positivo" y era positivo. ✔
- **VN (Verdadero Negativo):** el modelo dijo "negativo" y era negativo. ✔
- **FP (Falso Positivo):** el modelo dijo "positivo" pero era negativo. ✘ (marcó a alguien que no correspondía).
- **FN (Falso Negativo):** el modelo dijo "negativo" pero era positivo. ✘ (se le escapó alguien que sí correspondía).

> **Idea clave:** un modelo puede tener el mismo acierto global y aun así
> equivocarse de forma **distinta** en cada grupo. La herramienta calcula estos
> cuatro conteos **por separado para cada subgrupo** (cada valor de una variable
> protegida, p. ej. cada etnia, cada sexo, cada rango de edad) y a partir de ahí
> obtiene las métricas.

---

## 1. Tabla: "Total de instancias por subgrupo"

Es la tabla **base**: muestra los conteos crudos del modelo para cada subgrupo.
No mide todavía sesgo; sirve para entender el volumen y el balance de los datos.

| Columna | Qué significa |
|---|---|
| **Atributo** | La variable protegida analizada (p. ej. `etnia`, `sexo`, `rango_edad`). |
| **Valor Atributo** | El subgrupo dentro de esa variable (p. ej. `Afroamericano`, `Femenino`, `25 a 45`). |
| **Predichos Positivos (PP)** | A cuántas personas del subgrupo el modelo les predijo "positivo" (VP + FP). |
| **Predichos Negativos (PN)** | A cuántas les predijo "negativo" (VN + FN). |
| **Falsos Positivos (FP)** | Personas marcadas como positivas por error (eran negativas). |
| **Falsos Negativos (FN)** | Personas positivas que el modelo no detectó. |
| **Verdaderos Negativos (VN)** | Negativos correctamente predichos. |
| **Verdaderos Positivos (VP)** | Positivos correctamente predichos. |
| **Etiquetas Positivas Grupo** | Cuántas personas del subgrupo eran **realmente** positivas (VP + FN). |
| **Etiquetas Negativas Grupo** | Cuántas eran **realmente** negativas (VN + FP). |
| **Tamaño Grupo** | Total de personas en el subgrupo. |
| **Total Entidades** | Total de personas en toda la variable protegida. |
| *ID Modelo · Umbral Score · k* | Columnas **técnicas internas** (identificador del modelo y umbral de corte). Puedes ignorarlas. |

**¿Qué mirar aquí?**

- **Subgrupos pequeños:** fíjate en el `Tamaño Grupo`. Un grupo con muy pocos
  casos (p. ej. < 50) da métricas **poco confiables** — la herramienta los marca
  como *muestra insuficiente* y no los usa para el veredicto.
- **Desbalance:** si un subgrupo casi no tiene casos positivos reales
  (`Etiquetas Positivas Grupo` muy bajo), sus tasas serán inestables.

---

## 2. Tabla: "Métricas de error para cada subgrupo"

Convierte los conteos anteriores en **tasas (proporciones)** para poder comparar
subgrupos de distinto tamaño. Cada valor va de 0 a 1 (0 % a 100 %).

| Métrica | Fórmula (en palabras) | Qué responde |
|---|---|---|
| **Exactitud** | aciertos / total | ¿En qué proporción acertó el modelo en este subgrupo? |
| **TPR — Tasa de Verdaderos Positivos (Sensibilidad/Recall)** | VP / (VP + FN) | De los que **sí** eran positivos, ¿a cuántos detectó? |
| **TNR — Tasa de Verdaderos Negativos** | VN / (VN + FP) | De los que **sí** eran negativos, ¿a cuántos identificó bien? |
| **FPR — Tasa de Falsos Positivos** | FP / (FP + VN) | De los que **no** eran positivos, ¿a cuántos marcó por error? |
| **FNR — Tasa de Falsos Negativos** | FN / (FN + VP) | De los que **sí** eran positivos, ¿a cuántos se le escaparon? |
| **FOR — Tasa de Falsas Omisiones** | FN / (FN + VN) | De los que marcó como **negativos**, ¿cuántos eran en realidad positivos? |
| **FDR — Tasa de Falsos Descubrimientos** | FP / (FP + VP) | De los que marcó como **positivos**, ¿cuántos estaban mal? |
| **NPV — Valor Predictivo Negativo** | VN / (VN + FN) | De los que marcó como negativos, ¿cuántos acertó? |
| **Precisión (PPV)** | VP / (VP + FP) | De los que marcó como positivos, ¿cuántos acertó? |
| **PPR — Proporción Predicha Positiva** | PP / Tamaño Grupo | ¿A qué fracción del subgrupo marcó como positivo? |
| **Prevalencia Predicha** | PP / total predichos | Peso del subgrupo entre todos los positivos predichos. |
| **Prevalencia** | Etiquetas Positivas / Tamaño Grupo | ¿Qué fracción del subgrupo era **realmente** positiva? |

**Las 4 métricas que usa el veredicto de equidad** son las de error:
**FPR, FNR, FOR y FDR**. Las demás sirven de contexto.

- Usa **FPR / FDR** cuando un "positivo" trae una **acción punitiva** (vigilar,
  negar, sancionar): no quieres castigar de más a un grupo.
- Usa **FNR / FOR** cuando un "positivo" da acceso a un **beneficio** (apoyo,
  cupo, admisión): no quieres dejar fuera a un grupo que lo necesita.

**¿Qué mirar aquí?** Compara la misma métrica **entre subgrupos**. Si un grupo
tiene, por ejemplo, una FPR muy superior a los demás, el modelo lo está marcando
por error con más frecuencia.

> Esta tabla y la anterior son **absolutas**: describen a cada subgrupo por sí
> mismo. **No dependen del grupo de referencia** (ver sección 5).

---

## 3. Tabla: "Métricas de Disparidad (Análisis de Equidad)"

Aquí está el corazón del análisis de equidad. Toma las tasas del punto 2 y las
**compara con un grupo de referencia** para responder: *¿el modelo trata a este
subgrupo distinto que al grupo de referencia?*

### ¿Cómo se calcula la disparidad?

Para cada métrica y cada subgrupo:

```
Disparidad(grupo) = Métrica(grupo) ÷ Métrica(grupo de referencia)
```

**Ejemplo real (τ = 1.25, referencia = grupo mayoritario = Afroamericano):**

- FPR de Caucásico = 0.23; FPR de Afroamericano (referencia) = 0.44
- Disparidad FPR de Caucásico = 0.23 ÷ 0.44 = **0.52**

Interpretación: la tasa de falsos positivos de Caucásico es **la mitad** (0.52×)
que la del grupo de referencia.

### Cómo leer los valores

- El **grupo de referencia** siempre vale **1.00** (se compara consigo mismo).
  En las tablas de la herramienta aparece marcado con **"(ref)"**.
- **= 1.00** → sin diferencia respecto a la referencia.
- **> 1.00** → el subgrupo tiene **más** de esa métrica que la referencia
  (p. ej. 1.70 = 70 % más falsos positivos).
- **< 1.00** → el subgrupo tiene **menos** que la referencia
  (p. ej. 0.52 = 48 % menos).
- Cuanto **más cerca de 1.00**, más parejo (más equitativo) es el trato.

### Columnas de la tabla

- **Atributo / Valor del Atributo:** variable protegida y subgrupo.
- **Columnas de conteos y tasas** (PP, PN, FP…, FPR, FNR…): las mismas de las
  tablas 1 y 2, incluidas como referencia.
- **Disparidad en … (FPR, FNR, FOR, FDR, …):** el cociente explicado arriba.
- **Conclusión de Equidad:** el veredicto final del subgrupo, **Equitativo** o
  **No Equitativo**.

### ¿Cómo se decide "Equitativo" / "No Equitativo"?

Defines una **tolerancia τ** (el multiplicador del Paso 3; por defecto **1.25**,
la "regla del 80 %"). Un subgrupo es **equitativo** si **todas** sus
disparidades de veredicto (FPR, FNR, FOR, FDR) caen dentro del rango:

```
entre  1/τ  y  τ        →  con τ = 1.25:  entre 0.80 y 1.25
```

Si **alguna** de esas cuatro disparidades queda **fuera** del rango, el subgrupo
se marca **No Equitativo**. Los subgrupos de *muestra insuficiente* no cuentan
para el veredicto.

---

## 4. Cómo interpretar los gráficos

### 4.1. Gráfico de valores **absolutos** (pestaña "Análisis de Sesgos")

Barras con el **valor real** de una métrica (p. ej. FPR) para cada subgrupo.

- **Qué esperar si NO hay sesgo:** barras de **altura parecida** entre subgrupos.
- **Señal de alerta:** un subgrupo con una barra **mucho más alta o más baja**
  que el resto en una métrica de error.
- Ojo con los subgrupos de **pocos casos** (el número entre paréntesis): sus
  barras pueden ser extremas solo por azar.

### 4.2. Gráfico de **disparidad** (pestaña "Análisis de Equidad")

Muestra las disparidades (cocientes contra la referencia), no los valores
crudos. El grupo de referencia es el ancla en **1.00**.

- **Qué esperar si NO hay sesgo:** todos los subgrupos **cerca de 1.00**, dentro
  de la banda equitativa (0.80–1.25 con τ = 1.25).
- **Señal de alerta:** tiles/barras **lejos de 1.00**. Valores altos (> τ)
  indican que el subgrupo sufre **más** de ese error; valores bajos (< 1/τ),
  que sufre menos (o que la referencia está peor).
- **Qué NO deberías ver en un modelo equitativo:** disparidades grandes y
  sistemáticas (varias métricas fuera de rango) concentradas en un mismo grupo.

> Consejo: revisa **una métrica a la vez** eligiéndola en el selector, alineada
> con el objetivo de tu proyecto (punitivo → FPR/FDR; asistencial → FNR/FOR).

---

## 5. Pregunta frecuente: ¿qué cambia al cambiar el grupo de referencia?

**Cambiar el grupo de referencia y pulsar "Analizar Equidad" cambia únicamente
lo que es *relativo*:**

| Cambia | No cambia |
|---|---|
| ✅ Tabla **"Métricas de Disparidad"** (los cocientes) | ❌ "Total de instancias por subgrupo" |
| ✅ **Gráfico de disparidad** | ❌ "Métricas de error para cada subgrupo" |
| ✅ La marca **"(ref)"** y el panel "¿Contra qué se compara cada grupo?" | ❌ Toda la pestaña "Análisis de Sesgos" (es absoluta) |
| ✅ El **veredicto** de cada subgrupo (puede cambiar) | |

**Por qué:** el grupo de referencia es solo el **punto de comparación**. Los
conteos (cuántos FP, FN, etc.) y las tasas de cada subgrupo **no dependen** de
con quién los compares — por eso las dos primeras tablas y el gráfico absoluto se
ven **iguales**. Lo que sí se recalcula es la **disparidad** (el cociente contra
la nueva referencia) y, con ella, el gráfico de disparidad y el veredicto.

> Si cambiaste la referencia y "no viste cambios", probablemente estabas mirando
> una tabla **absoluta**. Fíjate en la tabla **"Métricas de Disparidad"** (la
> marca "(ref)" se mueve al nuevo grupo) y en el **gráfico de disparidad**.

**Un caso especial:** con el método **"Grupo con Mejor Desempeño"**, la
referencia puede ser **distinta para cada métrica** (el mejor grupo en FPR puede
no ser el mejor en FNR). En ese caso el panel indica *"varía por métrica"*.

---

## 6. Guía rápida: ¿en qué métrica enfocarme?

El siguiente árbol de decisión (en español, inspirado en el árbol de Aequitas)
te ayuda a elegir **en qué métrica concentrar el análisis** según lo que hace tu
modelo. Responde de arriba hacia abajo: primero decide si te importa la
**representación** o los **errores**; si son errores, define si la predicción
positiva **perjudica** (punitivo) o **ayuda** (asistencial).

![Árbol de decisión de métricas de equidad](img/arbol_metricas.png)

**Cómo usarlo:**

- **Representación** → usa **PPR** (mismo número por grupo) o **Prevalencia
  Predicha / Paridad Demográfica** (proporcional al tamaño del grupo).
- **Errores · contexto punitivo** (la predicción positiva perjudica: vigilar,
  negar, sancionar) → enfócate en **FPR** (principal) y **FDR**.
- **Errores · contexto asistencial** (la predicción positiva da un beneficio:
  apoyo, cupo, admisión) → enfócate en **FNR** (principal), **FOR** y, si solo
  puedes atender a una fracción, **TPR**.

Prioriza la métrica **principal** de tu contexto, pero revisa también las demás
del mismo grupo: una disparidad lejos de **1.00** en cualquiera es señal de
trato desigual.
