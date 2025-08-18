// Script para iniciar frontend e backend
// Execute: node claude-startup.js

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO EMPRESAS BRASIL - 66M EMPRESAS');
console.log('========================================');

let backendProcess = null;
let frontendProcess = null;

// Função para verificar se porta está em uso
function checkPort(port) {
    return new Promise((resolve) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            resolve(stdout.trim() !== '');
        });
    });
}

// Função para aguardar serviço estar disponível
function waitForService(url, maxAttempts = 30) {
    return new Promise((resolve) => {
        let attempts = 0;
        const check = () => {
            attempts++;
            exec(`curl -s ${url}`, (error) => {
                if (!error || attempts >= maxAttempts) {
                    resolve(!error);
                } else {
                    setTimeout(check, 1000);
                }
            });
        };
        check();
    });
}

async function killExistingProcesses() {
    console.log('🧹 Verificando processos existentes...');
    
    const port6000InUse = await checkPort(6000);
    const port4001InUse = await checkPort(4001);
    
    if (port6000InUse || port4001InUse) {
        console.log('⚠️  Matando processos nas portas 6000 e 4001...');
        return new Promise((resolve) => {
            exec('taskkill /f /im node.exe 2>nul', () => {
                setTimeout(resolve, 2000);
            });
        });
    }
}

function startBackend() {
    return new Promise((resolve) => {
        console.log('🔙 Iniciando Backend (porta 6000)...');
        
        const projectRoot = process.cwd();
        const backendPath = path.join(projectRoot, 'backend');
        
        backendProcess = spawn('node', ['server.js'], {
            cwd: backendPath,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
            detached: false
        });

        let backendReady = false;
        
        backendProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`🔙 Backend: ${output}`);
            
            if (output.includes('port') || output.includes('6000') || output.includes('listening')) {
                if (!backendReady) {
                    backendReady = true;
                    setTimeout(() => resolve(true), 1000);
                }
            }
        });

        backendProcess.stderr.on('data', (data) => {
            console.log(`🔙 Backend Error: ${data.toString().trim()}`);
        });

        backendProcess.on('close', (code) => {
            if (code !== 0) {
                console.log(`❌ Backend finalizado com código ${code}`);
            }
        });

        // Timeout de segurança
        setTimeout(() => {
            if (!backendReady) {
                console.log('🔙 Backend iniciado (timeout)');
                resolve(true);
            }
        }, 10000);
    });
}

function startFrontend() {
    return new Promise((resolve) => {
        console.log('🎨 Iniciando Frontend (porta 4001)...');
        
        const projectRoot = process.cwd();
        const frontendPath = path.join(projectRoot, 'frontend');
        
        frontendProcess = spawn('npm', ['run', 'dev'], {
            cwd: frontendPath,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
            detached: false
        });

        let frontendReady = false;
        
        frontendProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`🎨 Frontend: ${output}`);
            
            if (output.includes('Local:') || output.includes('ready') || output.includes('4001')) {
                if (!frontendReady) {
                    frontendReady = true;
                    setTimeout(() => resolve(true), 1000);
                }
            }
        });

        frontendProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('Local:') || output.includes('ready') || output.includes('4001')) {
                console.log(`🎨 Frontend: ${output}`);
                if (!frontendReady) {
                    frontendReady = true;
                    setTimeout(() => resolve(true), 1000);
                }
            }
        });

        frontendProcess.on('close', (code) => {
            if (code !== 0) {
                console.log(`❌ Frontend finalizado com código ${code}`);
            }
        });

        // Timeout de segurança
        setTimeout(() => {
            if (!frontendReady) {
                console.log('🎨 Frontend iniciado (timeout)');
                resolve(true);
            }
        }, 15000);
    });
}

async function startApp() {
    try {
        // Matar processos existentes
        await killExistingProcesses();
        
        // Iniciar backend
        await startBackend();
        
        // Aguardar um pouco antes do frontend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Iniciar frontend
        await startFrontend();
        
        // Aguardar um pouco antes de mostrar status final
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('');
        console.log('🎯 APLICAÇÃO FUNCIONANDO!');
        console.log('📱 Frontend: http://localhost:4001');
        console.log('🔧 Backend:  http://localhost:6000');
        console.log('');
        console.log('✅ Use Ctrl+C para parar os serviços');
        console.log('💡 Terminal disponível - processos rodando em background');
        console.log('');
        
        // Verificar serviços
        setTimeout(async () => {
            console.log('🔍 Verificando serviços...');
            
            const backendOk = await waitForService('http://localhost:6000/api/filters/options', 5);
            const frontendOk = await waitForService('http://localhost:4001', 5);
            
            console.log(`🔙 Backend: ${backendOk ? '✅ OK' : '❌ FALHA'}`);
            console.log(`🎨 Frontend: ${frontendOk ? '✅ OK' : '❌ FALHA'}`);
            console.log('');
        }, 5000);
        
    } catch (error) {
        console.error('❌ Erro ao iniciar aplicação:', error);
        process.exit(1);
    }
}

// Handler para Ctrl+C - mais seguro
process.on('SIGINT', () => {
    console.log('\n🛑 Parando serviços...');
    
    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGTERM');
    }
    
    if (frontendProcess && !frontendProcess.killed) {
        frontendProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
        console.log('✅ Serviços parados');
        process.exit(0);
    }, 2000);
});

// Iniciar aplicação
startApp();