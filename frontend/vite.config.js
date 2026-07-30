import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Recharts and socket.io are large and change far less often than app code,
    // so they are split out and stay cached across deploys. Route-level chunks
    // come from the React.lazy calls in App.jsx.
    rollupOptions: {
      output: {
        // Matched on the resolved module path rather than by package name: the
        // object form only catches a package's declared entry, so react-dom's
        // real bundle (reached via react-dom/client) stayed in the entry chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (/[\\/]node_modules[\\/](recharts|d3-|victory-|internmap|decimal\.js-light|fast-equals|eventemitter3)/.test(id)) {
            return 'charts';
          }
          if (/[\\/]node_modules[\\/](socket\.io-client|engine\.io-client|engine\.io-parser|socket\.io-parser)[\\/]/.test(id)) {
            return 'realtime';
          }
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
  },
})
