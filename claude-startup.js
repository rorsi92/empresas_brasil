// Script para iniciar o app no Claude Code
// Execute: node claude-startup.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO EMPRESAS BRASIL - 66M EMPRESAS');
console.log('========================================');

const projectRoot = process.cwd();
const backendPath = path.join(projectRoot, 'backend');
const frontendPath = path.join(projectRoot, 'frontend');

console.log('📍 Diretório do projeto:', projectRoot);
console.log('📍 Backend:', backendPath);
console.log('📍 Frontend:', frontendPath);
console.log('');

// Função para executar comando
function runCommand(command, args, cwd, name) {
    console.log(`🔄 Iniciando ${name}...`);
    
    const process = spawn(command, args, {
        cwd: cwd,
        stdio: 'inherit',
        shell: true
    });

    process.on('error', (error) => {
        console.error(`❌ Erro ao iniciar ${name}:`, error.message);
    });

    process.on('close', (code) => {
        console.log(`⚠️ ${name} encerrado com código ${code}`);
    });

    return process;
}

// Iniciar Backend usando run-server.js
console.log('🔙 Iniciando Backend na porta 6000...');
const backend = runCommand('node', ['run-server.js'], projectRoot, 'Backend');

// Aguardar um pouco antes de iniciar o frontend
setTimeout(() => {
    console.log('🎨 Iniciando Frontend na porta 4001...');
    const frontend = runCommand('npm', ['run', 'dev'], frontendPath, 'Frontend');
    
    setTimeout(() => {
        console.log('');
        console.log('✅ APLICAÇÃO INICIADA!');
        console.log('📱 URLs:');
        console.log('   Frontend: http://localhost:4001');
        console.log('   Backend:  http://localhost:6000');
        console.log('');
        console.log('⚠️ Para parar: Ctrl+C');
    }, 3000);
    
}, 2000);

// Capturar Ctrl+C para encerrar ambos os processos
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando aplicação...');
    process.exit();
});