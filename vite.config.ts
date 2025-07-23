/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [react(), vercel()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules', 
        'dist', 
        'build', 
        'public', 
        'src/components/Icons', 
        'eslint.*', 
        'vite.*', 
        'postcss.*', 
        'src/main.tsx', 
        'src/vite-env.d.ts', 
        'setupTests.ts'
      ],
    },
  },
  server: {
    port: process.env.PORT as unknown as number,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
