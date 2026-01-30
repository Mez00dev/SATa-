import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env.API_KEY': JSON.stringify("AIzaSyBoOi92EA-8ZFNTD5yEE1b5q21umj6NYzQ")
  }
});