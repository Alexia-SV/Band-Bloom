/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages publica el proyecto en https://alexia-sv.github.io/Band-Bloom/,
// así que la compilación necesita esa subcarpeta como ruta base.
// `npm run preview` sirve esa misma compilación, así que también la usa.
// En desarrollo (npm run dev) seguimos usando la raíz: http://localhost:5173/
const PAGES_BASE = '/Band-Bloom/'

// https://vite.dev/config/
// El plugin PWA (vite-plugin-pwa) ya está instalado; se configura en la Etapa 6
// junto con los íconos, el manifest y la estrategia offline.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
