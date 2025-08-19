// Quick Start para Claude Code - Processos Background
// Execute: node quick-start.js

const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 QUICK START - EMPRESAS BRASIL');
console.log('================================');

// Função para executar comando em background
function runBackground(command, name) {
    return new Promise((resolve) => {
        console.log(`🚀 Iniciando ${name}...`);
        
        const process = exec(command, { 
            windowsHide: false,
            detached: true 
        });
        
        // Não aguardar o processo terminar
        process.unref();
        
        setTimeout(() => {
            console.log(`✅ ${name} iniciado em background`);
            resolve();
        }, 1000);
    });
}

async function quickStart() {
    try {
        // Matar processos existentes
        console.log('🧹 Limpando processos...');
        exec('taskkill /f /im node.exe 2>nul');
        await new Promise(r => setTimeout(r, 2000));

        // Iniciar backend
        await runBackground(
            'cd backend && node server.js', 
            'Backend (6000)'
        );

        // Aguardar um pouco
        await new Promise(r => setTimeout(r, 2000));

        // Iniciar frontend  
        await runBackground(
            'cd frontend && npm run dev',
            'Frontend (4001)'
        );

        console.log('');
        console.log('🎯 SERVIÇOS INICIADOS!');
        console.log('📱 Frontend: http://localhost:4001'); 
        console.log('🔧 Backend:  http://localhost:6000');
        console.log('');
        console.log('✅ Processos rodando em background');
        console.log('💡 Terminal liberado para uso');
        console.log('📝 Use "tasklist | findstr node" para ver processos');
        console.log('');

        // Criar arquivo de status
        fs.writeFileSync('services-status.txt', `
EMPRESAS BRASIL - Status dos Serviços
====================================
Iniciado em: ${new Date().toLocaleString()}
Frontend: http://localhost:4001  
Backend: http://localhost:6000

Para parar os serviços:
taskkill /f /im node.exe
`);
        
        console.log('📄 Status salvo em: services-status.txt');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

quickStart();