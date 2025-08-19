// run-server.js - Wrapper para evitar timeout no Claude Code
// Este arquivo é usado pelo claude-startup.js conforme especificado no CLAUDE.md

const { spawn } = require('child_process');

console.log('🔧 Iniciando servidor via run-server.js (evita timeout)...');

const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('close', (code) => {
  console.log(`🔧 Server process exited with code ${code}`);
  process.exit(code);
});

// Pass through signals
process.on('SIGINT', () => {
  console.log('🛑 Stopping server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Terminating server...');
  serverProcess.kill('SIGTERM');
});