
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Development proxy
  server: mode === 'development' ? {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/event-app/backend/api'),
      },
    },
  } : undefined,
  // Production will use VITE_API_URL environment variable (injected at build time)
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
  },
}));
