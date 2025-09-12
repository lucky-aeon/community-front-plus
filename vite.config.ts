import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@apps': path.resolve(__dirname, './src/apps'),
      '@marketing': path.resolve(__dirname, './src/apps/marketing'),
      '@user-portal': path.resolve(__dirname, './src/apps/user-portal'),
      '@user-backend': path.resolve(__dirname, './src/apps/user-backend'),
    },
  },
});
