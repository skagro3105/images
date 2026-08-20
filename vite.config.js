import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure relative base path for GitHub Pages subpath compatibility
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
