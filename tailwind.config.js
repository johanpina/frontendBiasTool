/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Identidad "Civic Rose" (misma de la Evaluación de Impacto / GobLab).
      colors: {
        // Remapeo de `indigo` a la escala burdeos/rosa: así todo acento
        // (botones, enlaces, focos, badges) adopta la identidad sin tocar cada clase.
        indigo: {
          50: '#FBF3F4', 100: '#F4E4E7', 200: '#E8D1D5', 300: '#DCBBC1',
          400: '#C08A93', 500: '#A15E6B', 600: '#7A3B48', 700: '#652F3B',
          800: '#512530', 900: '#3D1C25',
        },
        paper: '#FAF7F4',
        'paper-deep': '#F2EDE6',
        line: '#E5DFD7',
        ink: {
          DEFAULT: '#0A0A0A', 80: '#2A2622', 60: '#5A534C', 40: '#8F877F', 20: '#D6D1CB',
        },
        burgundy: '#7A3B48',
        rose: '#C08A93',
        'rose-light': '#E8D1D5',
        'rose-tint': '#F4E4E7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
