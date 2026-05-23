/**
 * vite.config.js
 * Configuração do Vite para desenvolvimento.
 * O proxy redireciona /api para o backend Express em localhost:3001,
 * evitando problemas de CORS durante o desenvolvimento (ambos ficam na mesma origem
 * do ponto de vista do browser).
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Qualquer requisição começando com /api é repassada ao backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
