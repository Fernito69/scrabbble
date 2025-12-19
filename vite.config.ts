import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { versionGeneratorPlugin } from './vite-plugin-version'

export default defineConfig({
  plugins: [react(), versionGeneratorPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
