import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inlines the service worker registration into the bundle
      injectRegister: 'auto',
      // Dev mode: set to true for testing the SW locally
      devOptions: {
        enabled: false,
      },
      // Use the existing manifest.json in /public rather than generating one
      manifest: false,
      workbox: {
        // Files to precache (the app shell)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cap the precache size — avoids caching huge files unexpectedly
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB

        runtimeCaching: [
          // Supabase API — NetworkFirst: always try to get fresh data,
          // fall back to cache when offline
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://hpddjhajklbgxcqgbvzc.supabase.co',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts / any CDN fonts — CacheFirst for performance
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Static image assets — CacheFirst
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
})
