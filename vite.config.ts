import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Garantiza una única copia de React (recharts arrastra react-redux y podía
  // provocar "Invalid hook call / more than one copy of React").
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
    exclude: ['lucide-react'],
  },
});
