import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite will replace 'process.env.API_KEY' with the actual value during the build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "AIzaSyBoOi92EA-8ZFNTD5yEE1b5q21umj6NYzQ")
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000
  }
});