# Documentación — Herramienta de Sesgos y Equidad (GobLab UAI)

Esta carpeta contiene los manuales de la herramienta y el material de apoyo.

| Documento | Para quién | Contenido |
|---|---|---|
| **[MANUAL_USUARIO.md](MANUAL_USUARIO.md)** | Analistas / científicos de datos del sector público | Guía paso a paso: cómo usar cada sección, cómo interpretar cada gráfico y tabla, cuándo usar cada métrica y en qué enfocarse. Ilustrado con capturas reales de la interfaz. |
| **[MANUAL_TECNICO.md](MANUAL_TECNICO.md)** | Desarrolladores / mantenedores | Arquitectura, módulos, endpoints, fórmulas de las métricas, ejecución local, pruebas y despliegue. |

## Material de apoyo

- **`datos_demo_compas_es.csv`** — dataset de demostración (versión en español del
  dataset COMPAS de reincidencia, 7.214 filas). Úsalo para reproducir todos los
  ejemplos de los manuales.
  - Columnas: `id`, `prediccion` (0/1), `reincidio` (0/1), `etnia`, `sexo`, `rango_edad`.
- **`img/`** — capturas de pantalla reales de la interfaz usadas en el manual de usuario.
