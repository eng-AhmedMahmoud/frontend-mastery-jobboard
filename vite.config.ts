import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  // Honour the port the environment hands us (portless sets PORT); never hardcode one.
  server: {
    ...(process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {}),
    ...(process.env.HOST ? { host: process.env.HOST } : {}),
    // The portless proxy forwards with a *.localhost Host header.
    allowedHosts: ['.localhost'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
