import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, Vite serves the frontend and proxies API + redirect routes to Express.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/go': 'http://localhost:3000',
    },
  },
});
