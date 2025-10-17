import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      
      // Configuración del manifest
      manifest: {
        name: 'DeptoCorp Residentes',
        short_name: 'DeptoCorp',
        description: 'App para residentes - Gestión de gastos comunes, avisos y reservas',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es-CL',
        categories: ['lifestyle', 'utilities'],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      
      // Service Worker con Workbox
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        
        // Estrategias de caché
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
              }
            }
          }
        ]
      },
      
      // Configuración del dev server
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  
  resolve: {
    alias: {
      '@deptocorp/shared': path.resolve(__dirname, '../../packages/shared'),
      '@deptocorp/supabase-client': path.resolve(__dirname, '../../packages/supabase-client/src'),
    },
  },
  
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  
  // Optimizaciones para móvil
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['lucide-react', 'react-hot-toast']
        }
      }
    }
  }
})