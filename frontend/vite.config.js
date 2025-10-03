import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion']
        }
      }
    },
    minify: 'esbuild',
    target: 'esnext',
    cssMinify: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
})
