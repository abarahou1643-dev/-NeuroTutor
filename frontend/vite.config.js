import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    open: true,
    cors: true,
    // CRITIQUE: Pour React Router
    historyApiFallback: {
      rewrites: [
        { from: /^\/health$/, to: '/' }, // Redirige /health vers l'app
        { from: /.*/, to: '/' } // Toutes les autres routes vers l'app
      ]
    }
  },
  // Pour le build
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Base URL pour le build
  base: '/'
});