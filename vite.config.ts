/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// El plugin PWA (vite-plugin-pwa) ya está instalado; se configura en la Etapa 6
// junto con los íconos, el manifest y la estrategia offline.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
