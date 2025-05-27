import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  //  This is the crucial part for routing support in production
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  //  Add this to support client-side routing in production
  optimizeDeps: {
    include: [],
  },
  //  The important fix
  preview: {
    // Required for Vercel/Netlify-like SPA behavior
    fallback: '/index.html'
  }
})
