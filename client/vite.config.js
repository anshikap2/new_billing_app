import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ important for correct asset paths in production
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ safer alias resolution
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: 'index.html' // ✅ no need to use `{ main: 'index.html' }` — use string
    }
  }
})
