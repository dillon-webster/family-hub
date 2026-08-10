import { resolve } from 'node:path';

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `npm run dev` has no Rust server in front of it, so nothing maps /phone onto
 * the companion's entry point the way the backend does in production. Without
 * this, the phone surface is only reachable in dev as /phone.html — a different
 * URL from the real one, which is how a path-routed app gets tested wrong.
 */
function phoneEntry(): Plugin {
  return {
    name: 'family-hub-phone-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/phone' || req.url?.startsWith('/phone?')) {
          req.url = '/phone.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), phoneEntry()],
  server: {
    // `npm run dev` serves the UI and forwards the API and the event stream to
    // the Rust backend. `ws: false` because SSE is plain HTTP — proxying it as
    // a websocket upgrade would break the live link.
    proxy: {
      '/api': {
        target: process.env.API_ORIGIN ?? 'http://127.0.0.1:3108',
        changeOrigin: true,
        ws: false,
      },
    },
  },
  build: {
    // Font files and three icons; nothing here benefits from being inlined
    // into the JS, and the kiosk caches them after the first load anyway.
    assetsInlineLimit: 0,
    rollupOptions: {
      // Two HTML entry points, one bundle: both pages load the same
      // src/main.tsx, which still picks its surface from the path. The split
      // exists for the head — manifest, icon title, status bar — not the code.
      input: {
        main: resolve(__dirname, 'index.html'),
        phone: resolve(__dirname, 'phone.html'),
      },
    },
  },
});
