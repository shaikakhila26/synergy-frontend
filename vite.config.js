import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',   // 👈 Fix for "global is not defined"
  },
  optimizeDeps: {
    include: ['simple-peer'],
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
})
