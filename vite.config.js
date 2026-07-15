import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'GymRat - Gestor de Rutinas',
        short_name: 'GymRat',
        description: 'Gestiona rutinas de entrenamiento para tus alumnos del gimnasio',
        theme_color: '#f97316',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,gif}'],
        globIgnores: ['**/exercises.json'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          },
          {
            urlPattern: /\/exercises\.json$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'exercises-data', expiration: { maxAgeSeconds: 60 * 60 * 24 } }
          },
          {
            urlPattern: /\/images\//,
            handler: 'CacheFirst',
            options: { cacheName: 'exercise-images', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            urlPattern: /\/videos\//,
            handler: 'CacheFirst',
            options: { cacheName: 'exercise-videos', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ],
  server: { host: true }
})
