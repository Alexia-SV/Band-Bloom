/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages publica el proyecto en https://alexia-sv.github.io/Band-Bloom/,
// así que la compilación necesita esa subcarpeta como ruta base.
// `npm run preview` sirve esa misma compilación, así que también la usa.
// En desarrollo (npm run dev) seguimos usando la raíz: http://localhost:5173/
const PAGES_BASE = '/Band-Bloom/'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    // App instalable y sin internet: todo lo de la app (código, fuentes, ilustraciones, fotos, emoji)
    // se guarda en el dispositivo. Los datos de Supabase siempre van a la red.
    // 'prompt': la versión nueva se instala cuando tú tocas "Actualizar", así no se recarga a medio entrenamiento.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Band & Bloom',
        short_name: 'Band & Bloom',
        description: 'Tu rutina de fuerza en casa con ligas, sin presión.',
        lang: 'es-MX',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#f8f6fd',
        theme_color: '#ede9fe',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
