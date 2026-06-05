// Copyright (c) 2026 Nagravision SARL
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3001',
      '/images': 'http://localhost:3001',
      '/processed': 'http://localhost:3001',
      '/results': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return req.url;
          }
        }
      },
      '/training': 'http://localhost:3001',
    }
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
