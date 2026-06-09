/**
 * PM2 on Windows uses a single global named pipe (\\.\pipe\rpc.sock),
 * which breaks when multiple PM2_HOME instances run. Patch local PM2 to
 * derive pipe names from PM2_HOME.
 */
const fs = require('fs');
const path = require('path');

if (process.platform !== 'win32') process.exit(0);

const pathsFile = path.join(__dirname, '..', 'node_modules', 'pm2', 'paths.js');
if (!fs.existsSync(pathsFile)) process.exit(0);

const src = fs.readFileSync(pathsFile, 'utf8');
if (src.includes('pipeId = PM2_HOME.replace')) {
  process.exit(0);
}

const oldBlock = `    pm2_file_stucture.DAEMON_RPC_PORT = '\\\\\\\\.\\\\pipe\\\\rpc.sock';
    pm2_file_stucture.DAEMON_PUB_PORT = '\\\\\\\\.\\\\pipe\\\\pub.sock';
    pm2_file_stucture.INTERACTOR_RPC_PORT = '\\\\\\\\.\\\\pipe\\\\interactor.sock';`;

const newBlock = `    var pipeId = PM2_HOME.replace(/[^a-zA-Z0-9]/g, '-');
    pm2_file_stucture.DAEMON_RPC_PORT = '\\\\\\\\.\\\\pipe\\\\pm2-' + pipeId + '-rpc.sock';
    pm2_file_stucture.DAEMON_PUB_PORT = '\\\\\\\\.\\\\pipe\\\\pm2-' + pipeId + '-pub.sock';
    pm2_file_stucture.INTERACTOR_RPC_PORT = '\\\\\\\\.\\\\pipe\\\\pm2-' + pipeId + '-interactor.sock';`;

if (!src.includes(oldBlock)) {
  console.warn('[patch-pm2-windows] paths.js format changed; skip patch');
  process.exit(0);
}

fs.writeFileSync(pathsFile, src.replace(oldBlock, newBlock));
console.log('[patch-pm2-windows] Patched', pathsFile);
