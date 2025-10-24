import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // 放开所有 Host 校验（开发环境）
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8520',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket 代理到后端（聊天室）
      '/ws': {
        target: 'http://127.0.0.1:8520',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    }
  },
  // 预览模式同样允许上述域名（如使用 `npm run preview`）
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
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
      '@admin-backend': path.resolve(__dirname, './src/apps/admin-backend'),
    },
  },
});
