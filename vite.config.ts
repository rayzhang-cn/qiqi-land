/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '奇奇乐园',
        short_name: '奇奇乐园',
        display: 'standalone',
        background_color: '#FFF8E7',
        theme_color: '#FFB74D',
        lang: 'zh-CN',
        icons: [
          { src: 'icons/icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});