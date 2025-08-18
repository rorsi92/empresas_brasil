// Script para iniciar a aplicação em background
// Execute: node start-app.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO EMPRESAS BRASIL - 66M EMPRESAS');
console.log('========================================');

// Matar processos existentes
console.log('🧹 Limpando processos Node.js...');
const killProcess = spawn('taskkill', ['/f', '/im', 'node.exe'], { 
    stdio: 'pipe', 
    shell: true 
});

killProcess.on('close', () => {
    console.log('✅ Processos anteriores finalizados');
    
    setTimeout(() => {
        startServices();
    }, 1000);
});

function startServices() {
    const projectRoot = process.cwd();
    const backendPath = path.join(projectRoot, 'backend');
    const frontendPath = path.join(projectRoot, 'frontend');

    console.log('📍 Diretório:', projectRoot);

    // Iniciar Backend
    console.log('🔙 Iniciando Backend (porta 6000)...');
    const backend = spawn('node', ['run-server.js'], {
        cwd: backendPath,
        stdio: ['ignore', 'ignore', 'ignore'],
        detached: true,
        shell: true
    });

    if (backend.pid) {
        console.log(`✅ Backend iniciado (PID: ${backend.pid})`);
        backend.unref();
    }

    // Aguardar e iniciar Frontend
    setTimeout(() => {
        console.log('🎨 Iniciando Frontend (porta 4001)...');
        const frontend = spawn('npm', ['run', 'dev'], {
            cwd: frontendPath,
            stdio: ['ignore', 'ignore', 'ignore'],
            detached: true,
            shell: true
        });

        if (frontend.pid) {
            console.log(`✅ Frontend iniciado (PID: ${frontend.pid})`);
            frontend.unref();
        }

        // Status final
        setTimeout(() => {
            console.log('');
            console.log('🎯 APLICAÇÃO FUNCIONANDO!');
            console.log('📱 Frontend: http://localhost:4001');
            console.log('🔧 Backend:  http://localhost:6000');
            console.log('');
            console.log('✨ Processos rodando em background');
            console.log('💡 Terminal liberado para uso');
            console.log('');
            console.log('Para parar: taskkill /f /im node.exe');
            
            // Encerrar o script
            process.exit(0);
        }, 3000);

    }, 2000);
}