import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        open: false,
      },
      plugins: [react(), tailwindcss()],
      define: {
        // Устанавливаем правильный URL API по умолчанию
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://api.outlivion.space')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
      },
      root: '.',
      clearScreen: false,
    };
});
