// Script para manter o servidor rodando
const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Iniciando servidor...');

const serverPath = path.join(__dirname, 'backend', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'backend')
});

server.on('close', (code) => {
  console.log(`Servidor fechou com código ${code}`);
});

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});

// Manter processo vivo
process.on('SIGINT', () => {
  console.log('🛑 Parando servidor...');
  server.kill();
  process.exit(0);
});