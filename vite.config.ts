import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173, // Стандартный порт Vite (не конфликтует с ботом на 3000)
        host: '0.0.0.0',
        open: false,
      },
      plugins: [react(), tailwindcss()],
      define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3000')
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
      test: {
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        globals: true,
      },
    };
});
