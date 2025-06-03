import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          icons: ['@heroicons/react'],
          utils: ['date-fns', 'react-hot-toast']
        },
      },
    },
  },
  base: './',
  define: {
    __API_URL__: JSON.stringify(
      process.env.VITE_API_URL || 
      (mode === 'production' ? 'https://pos-backend.onrender.com/api' : 'http://localhost:8080/api')
    ),
  },
}))
