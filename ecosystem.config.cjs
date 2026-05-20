const node = 'C:\\Program Files\\nodejs\\node.exe';

module.exports = {
  apps: [
    {
      name: 'amalgated-api',
      script: 'backend/server.js',
      cwd: __dirname,
      interpreter: node,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'amalgated-vite',
      script: 'node_modules/vite/bin/vite.js',
      args: '--config frontend/vite.config.mts',
      cwd: __dirname,
      interpreter: node,
    },
  ],
};
