import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CriptoSimuladorApp',
        short_name: 'CriptoSimulador',
        start_url: '.',
        display: 'standalone',
        background_color: '#001f2d',
        theme_color: '#001f2d',
        icons: [
          {
            src: '/logo-wkr.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-wkr.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
