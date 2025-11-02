import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      // All API requests should go through the proxy server on port 3001
      // This allows both backend API calls and direct blockchain calls
      '/api': {
        target: 'http://localhost:3001', // Proxy server port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // For direct blockchain calls (when needed), we can proxy to the proxy server
      // which will forward to the blockchain node
      '/eth': {
        target: 'http://localhost:3001', // Proxy server
        changeOrigin: true,
        secure: false,
      },
      '/web3': {
        target: 'http://localhost:3001', // Proxy server
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
