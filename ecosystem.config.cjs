const node = 'C:\\Program Files\\nodejs\\node.exe';
const networkHost = '192.168.0.222';
const publicOrigin = 'https://theamalgatedproperties.com';

module.exports = {
  apps: [
    // Frontend dev server (Vite) — http://192.168.0.222:6175
    {
      name: 'frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--config frontend/vite.config.mts --host 0.0.0.0 --strictPort --port 6175',
      cwd: __dirname,
      interpreter: node,
      instances: 1,
      autorestart: true,
      kill_timeout: 5000,
      restart_delay: 2000,
      max_restarts: 10,
      min_uptime: '10s',
    },
    // API + backend (Express, Socket.io, routes) — http://192.168.0.222:8020
    {
      name: 'api',
      script: 'backend/server.js',
      cwd: __dirname,
      interpreter: node,
      instances: 1,
      autorestart: true,
      kill_timeout: 8000,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'development',
        PORT: '8020',
        HOST: '0.0.0.0',
        NETWORK_HOST: networkHost,
        PUBLIC_ORIGIN: publicOrigin,
      },
    },
  ],
};
