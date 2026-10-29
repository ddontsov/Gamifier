/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages отдаёт сайт по адресу https://<user>.github.io/<repo>/.
const base = process.env.BASE_PATH ?? '/';
// Номер сборки для экрана родителя: коммит из GitHub Actions и дата.
const build = `${(process.env.GITHUB_SHA ?? 'local').slice(0, 7)} от ${new Date().toISOString().slice(0, 10)}`;

export default defineConfig({
  base,
  define: {
    __APP_BUILD__: JSON.stringify(build),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Игрофикатор',
        short_name: 'Игрофикатор',
        description: 'Игровой тренажёр: таблица умножения и другие предметы',
        lang: 'ru',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f3efff',
        theme_color: '#7c5cff',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
