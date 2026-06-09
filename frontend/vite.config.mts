import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'theamalgatedproperties.com',
      'www.theamalgatedproperties.com',
      '.theamalgatedproperties.com',
      'localhost',
      '192.168.0.222',
    ],
    port: 6175,
    proxy: {
      '/api': 'http://localhost:8020',
      '/socket.io': {
        target: 'http://localhost:8020',
        ws: true,
      },
    },
  }
});

