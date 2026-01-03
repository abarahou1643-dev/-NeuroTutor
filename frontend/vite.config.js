// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8085", // ✅ ICI
        changeOrigin: true,
        secure: false,
      },
      "/exo": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/exo/, ""),
      },
      "/ai": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ai/, ""),
      },
    },
  },
});
