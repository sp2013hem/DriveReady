import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'DriveReady – German Theory Test',
        short_name: 'DriveReady',
        start_url: '/',
        display: 'standalone',
        background_color: '#f5f7fb',
        theme_color: '#1e5eff',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/media\/.*\.webp$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 900 } },
          },
          {
            // videos are range-requested; cache on demand so replays work offline
            urlPattern: /\/media\/.*\.mp4$/,
            handler: 'CacheFirst',
            options: { cacheName: 'videos', rangeRequests: true, cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 300 } },
          },
        ],
      },
    }),
  ],
})
