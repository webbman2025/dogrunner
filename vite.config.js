import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  optimizeDeps: {
    include: ['phaser'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2015',
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
});
