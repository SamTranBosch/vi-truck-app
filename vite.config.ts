import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' lets the built files be hosted at any path (Cloudflare Pages, GitHub Pages, a folder).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'Xe Học Chữ',
        short_name: 'Xe Học Chữ',
        description: 'Học chữ cùng xe cứu hỏa: bé lau bùn để lộ chiếc xe.',
        lang: 'vi',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#BFE4F2',
        theme_color: '#BFE4F2',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app itself is precached. Teacher-voice clips are NOT: there are several voice sets (about 2 MB each) and
        // only the chosen one is needed. The app downloads the chosen set once (src/lib/audio.ts) and this rule keeps it.
        // rangeRequests: Safari asks for audio in byte ranges and only plays a cached file when the answer supports them.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) => /\/audio\/[^/]+\/[^/]+\.mp3$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'teacher-voice',
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) => /\/audio\/(voices|[^/]+\/manifest)\.json$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'teacher-voice-lists', networkTimeoutSeconds: 3 },
          },
        ],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
});
